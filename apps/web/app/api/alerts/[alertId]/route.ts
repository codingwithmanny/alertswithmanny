// Imports
// ========================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
import { Client, Receiver } from "@upstash/qstash";
import nodemailer from "nodemailer";

// Config
// ========================================================
const prisma = new PrismaClient();
const client = new Client({
  token: `${process.env.QSTASH_TOKEN}`,
});
const receiver = new Receiver({
  currentSigningKey: `${process.env.QSTASH_CURRENT_SIGNING_KEY}`,
  nextSigningKey: `${process.env.QSTASH_NEXT_SIGNING_KEY}`,
});
const mailer = nodemailer.createTransport({
  host: `${process.env.EMAIL_HOST}`,
  port: parseInt(`${process.env.EMAIL_PORT}`),
  secure: true,
  auth: {
    user: `${process.env.EMAIL_AUTH_USER}`,
    pass: `${process.env.EMAIL_AUTH_PASSWORD}`,
  },
});

// Functions
// ========================================================
/**
 * Request
 * @param request
 * @returns
 */
export const POST = async (
  request: NextRequest,
  { params }: { params: { alertId: string } }
) => {
  const { alertId } = params;
  console.log({ alertId });

  try {
    // Verify request signature
    const isVerified = await receiver.verify({
      body: JSON.stringify(await request.json()),
      signature: request.headers.get("upstash-signature") as string,
      url: `${process.env.DOMAIN_URL}/api/alerts/${alertId}`
    });
    // console.log({ isVerified });

    // Query
    const response = await prisma.alert.findUnique({
      where: {
        id: alertId,
      },
    });
    // console.log({ response });

    if (!response) {
      throw new Error("Alert not found");
    }

    if (["DISABLED", "COMPLETE"].includes(response?.status as string)) {
      return NextResponse.json(
        {
          data: response,
        },
        {
          status: 200,
        }
      );
    }

    // @TODO handle for live networks
    const network = response.network;
    const provider = new ethers.JsonRpcProvider();
    const contract = new ethers.Contract(
      response.contractAddress,
      JSON.parse(response.contractABI)?.abi,
      provider
    );
    const readTx = await contract?.[`${response.functionName}`]();

    let value = readTx;
    if (Array.isArray(readTx)) {
      value = readTx[response.functionValueIndex];
    }

    if (response.functionValueType.indexOf("int") > -1) {
      value = parseInt(value);
    }

    // Evaluate the result
    let result = false;
    let status = "RUNNING";
    try {
      console.log(`${value} ${response.operator} ${response.conditionValue}`);
      result = eval(`${value} ${response.operator} ${response.conditionValue}`);
      console.log({ result });
      if (result) {
        mailer.sendMail({
          from: `${process.env.EMAIL_FROM}`,
          to: `${response.email}`,
          subject: `Alert Triggered - ${response.id}`,
          text: `Alert triggered for ${response.id} with '${value} ${response.operator} ${response.conditionValue}'`,
        });
        status = "COMPLETE";
        await client.schedules.delete({
          id: response.jobId as string,
        });
      }
    } catch (error) {
      // Do nothing
    }

    // Update attemps
    const totalAttempts = response.attempts + 1;

    // If attempts over 10 disable job
    if (totalAttempts >= 10) {
      status = "DISABLED";
      await client.schedules.delete({
        id: response.jobId as string,
      });
    }

    await prisma.alert.update({
      where: {
        id: alertId,
      },
      data: {
        attempts: totalAttempts,
        status,
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
    console.log({ error });
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
