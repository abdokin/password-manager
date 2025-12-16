import { NextRequest, NextResponse } from "next/server";

import { addEmailJob } from "@/lib/jobs/queue";

// API route to trigger email jobs (for testing or manual triggers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: "Missing type or data" }, { status: 400 });
    }

    const job = await addEmailJob(type, data);
    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: "Email job queued successfully",
    });
  } catch (error: any) {
    console.error("Error queuing email job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to queue email job" },
      { status: 500 }
    );
  }
}

// Get job status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
  }

  try {
    const { emailQueue } = await import("@/lib/jobs/queue");
    const job = await emailQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress;
    const returnValue = job.returnvalue;
    const failedReason = job.failedReason;

    return NextResponse.json({
      jobId: job.id,
      state,
      progress,
      returnValue,
      failedReason,
    });
  } catch (error: any) {
    console.error("Error getting job status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get job status" },
      { status: 500 }
    );
  }
}
