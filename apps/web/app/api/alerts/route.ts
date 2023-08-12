// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Client, PublishJsonRequest } from "@upstash/qstash";

// Config
// ========================================================
const prisma = new PrismaClient();
const client = new Client({
  token: `${process.env.QSTASH_TOKEN}`,
});

// Functions
// ========================================================
/**
 * Create Alert
 * @param request
 * @returns
 */
export const POST = async (request: NextRequest) => {
  // Get Payload
  const payload = await request.json();

  try {
    // Query
    const response = await prisma.alert.create({
      data: {
        ...payload,
      },
    });

    if (!response) {
      throw new Error("Alert not found");
    }

    // Create qstash cron
    const publisJSONOptions: PublishJsonRequest = {
      url: `${process.env.DOMAIN_URL}/api/alerts/${response.id}`,
      body: {},
      headers: {},
      cron: "* * * * *", // Every minute
    };

    const res = (await client.publishJSON(publisJSONOptions)) as {
      messageId?: string;
      scheduleId?: string;
    };
    const messageId = res?.messageId ?? res.scheduleId;

    await prisma.alert.update({
      data: {
        jobId: messageId,
      },
      where: {
        id: response.id,
      },
    });

    // Return
    return NextResponse.json(
      {
        data: response,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    // Failure
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 404,
      }
    );
  }
};
