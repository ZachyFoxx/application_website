import { NextApiResponse } from "next";
import { compareForms, createApplication, createChangeLog, getApplicationById, updateApplication } from "src/util/database";
import { dbConnect } from "src/util/mongodb";
import { Action, Application, ApplicationWithId, ChangeLog, DISCORD, FormType } from "src/types";
import { NextIronRequest, withAuth } from "../../../util/session";
import { isStaff } from "src/util/permission";
import { sendDm } from "src/util/discord";

const handler = async (req: NextIronRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const application: Application = req.body.application;
    const applicationId: string = req.body.applicationId;
    const user = req.session.get("user");

    if (!isStaff(user)) {
      return res
        .status(403)
        .json({ message: `You are unable to view this application...` });
    }

    if (!application || !applicationId) {
      return res.status(400).json({
        message: "Please provide a valid application form and application ID.",
      });
    }
    try {
      const oldApplication = await getApplicationById(applicationId);
      const result = await updateApplication(applicationId, application);
      if (result.acknowledged) {

        const changeLog: ChangeLog = {
          userId: user.id,
          form: FormType.APPLICATION,
          formId: applicationId,
          action: Action.MODIFIED,
          changes: compareForms(oldApplication!!, application as ApplicationWithId),
        }
        await createChangeLog(changeLog)

        if (req.body.statusUpdate) {
          await sendDm(application.applicantId, {
            embeds: [
              {
                type: "rich",
                title: `Application Update`,
                description: `Your PGN: Underground staff application has been updated!`,
                color: application.status === 2 ? 0xeb0909 : 0x0bef16 ,
                fields: [
                  {
                    name: `Status`,
                    value: application.status === 1 ? "Approved" : "Rejected",
                    inline: true,
                  },
                  {
                    name: `Reason`,
                    value: application.statusReason || "no reason given",
                  },
                ],
                footer: {
                  text: `This is an automated message regarding your PGN: Underground staff application. Do not reply to this message as it is not monitored`,
                },
                url: `${process.env.DOMAIN}/applications/${applicationId}`,
                timestamp: new Date(),
              },
            ],
          });
        }
        res.status(200).json({ message: "Application updated successfully" });
      } else {
        res.status(500).json({ message: "Failed to update the application" });
      }
    } catch (error: any) {
      console.log(error)
      res.status(500).json({
        message: "Error updating the application",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
