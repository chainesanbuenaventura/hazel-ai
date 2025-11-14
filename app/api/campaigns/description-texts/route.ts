import { NextRequest, NextResponse } from 'next/server';
import { getNeo4jDriver } from '@/lib/neo4j';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get('candidateId');
  const campaignId = searchParams.get('campaignId');
  const candidateProfileUrl = searchParams.get('candidateProfileUrl');
  const jobTitle = searchParams.get('jobTitle');
  const jobCompany = searchParams.get('jobCompany');
  const jobLocation = searchParams.get('jobLocation');

  if (!candidateProfileUrl || !jobTitle || !jobCompany || !jobLocation) {
    return NextResponse.json(
      { error: 'Missing required parameters: candidateProfileUrl, jobTitle, jobCompany, jobLocation' },
      { status: 400 }
    );
  }

  try {
    const driver = getNeo4jDriver();
    const session = driver.session();

    // Construct the job application link using the formula: {title_norm}|{company}|{location}
    const jobApplicationLink = `${jobTitle}|${jobCompany}|${jobLocation}`;

    const query = `
      MATCH (c:Candidate {profile_url: $candidateProfileUrl})
      MATCH (j:Job {application_link: $jobApplicationLink})
      RETURN c.description_text as candidateDescription, j.description_text as jobDescription
    `;

    const result = await session.run(query, { 
      candidateProfileUrl, 
      jobApplicationLink 
    });
    await session.close();

    if (result.records.length === 0) {
      return NextResponse.json(
        { error: 'No data found for the given candidate and job' },
        { status: 404 }
      );
    }

    const record = result.records[0];
    const candidateDescription = record.get('candidateDescription');
    const jobDescription = record.get('jobDescription');

    return NextResponse.json({
      candidateDescription: candidateDescription || 'No description available',
      jobDescription: jobDescription || 'No description available'
    });

  } catch (error) {
    console.error('Error querying Neo4j for description texts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch description texts' },
      { status: 500 }
    );
  }
}
