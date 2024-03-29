import { Action, ChangeLog, FormActionChange, FormType, Interview } from "./../types";
import { Filter, ObjectId } from "mongodb";
import { Application, User } from "src/types";
import {
  closeConnection,
  getApplicationCollection,
  getChangeLogCollection,
  getInterviewCollection,
  getUserCollection,
} from "./mongodb";
import { DISCORD } from "src/types";

export const createApplication = async (application: Application) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.insertOne(application);

  return res;
};

export const getApplicationById = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  try {
    const res = await applicationCollection.collection.findOne({
      _id: new ObjectId(id),
    });

    return res;
  } catch (err) {
    return null;
  }
};

export const getAllApplications = async () => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.find().toArray();

  return res;
};

export const getUserApplicationsInRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  const applicationCollection = await getApplicationCollection();
  try {
    const res = await applicationCollection.collection
      .find({
        userId: userId,
        submissionDate: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getApplicationsInRange = async (
  startDate: Date,
  endDate: Date
) => {
  const applicationCollection = await getApplicationCollection();
  try {
    const res = await applicationCollection.collection
      .find({
        submissionDate: { $gte: startDate, $lte: endDate },
      })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getApplicationPage = async (
  page: number,
  pageLength: number,
  userId?: string
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await applicationCollection.collection
    .find(userId ? { applicantId: userId } : {})
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const updateApplication = async (
  id: string,
  updatedApplication: Partial<Application>
) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedApplication }
  );

  return res;
};

export const deleteApplication = async (id: string) => {
  const applicationCollection = await getApplicationCollection();
  const res = await applicationCollection.collection.deleteOne({
    _id: new ObjectId(id),
  });

  return res;
};

export const getSortedApplications = async (
  page: number,
  pageLength: number,
  sortStatus: "asc" | "desc",
  userId?: string
) => {
  const applicationCollection = await getApplicationCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const applications = await applicationCollection.collection
    .find(userId ? { applicantId: userId } : {})
    .sort({ status: sortDirection, _id: 1 })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const createInterview = async (interview: Interview) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.insertOne(interview);
  return res;
};

export const getInterview = async (id: string) => {
  const interviewCollection = await getInterviewCollection();
  let res;
  try {
    const res2 = await interviewCollection.collection.findOne({ _id: new ObjectId(id) });
    res = res2;
  } catch (err) {
    return null;
  }
  return res;
};

export const getallInterviews = async () => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.find().toArray();

  return res;
};

export const getInterviewPage = async (page: number, pageLength: number, userId?: string) => {
  const interviewCollection = await getInterviewCollection();
  const skipCount = (page - 1) * pageLength;

  const applications = await interviewCollection.collection
  .find(userId ? { applicantId: userId } : {})
  .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return applications;
};

export const updateInterview = async (
  id: string,
  updatedInterview: Partial<Interview>
) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedInterview }
  );

  return res;
};

export const deleteInterview = async (id: string) => {
  const interviewCollection = await getInterviewCollection();
  const res = await interviewCollection.collection.deleteOne({
    _id: new ObjectId(id),
  });

  return res;
};

export const getSortedInterviews = async (
  page: number,
  pageLength: number,
  sortStatus: "asc" | "desc",
  userId?: string
) => {
  const interviewCollection = await getInterviewCollection();
  const skipCount = (page - 1) * pageLength;
  const sortDirection = sortStatus === "asc" ? 1 : -1;

  const interviews = await interviewCollection.collection
    .find(userId ? { applicantId: userId } : {})
    .sort({ status: sortDirection, _id: 1 })
    .skip(skipCount)
    .limit(pageLength)
    .toArray();

  return interviews;
};

export const getUser = async (id: string) => {
  const userCollection = await getUserCollection();
  const user = await userCollection.collection.findOne({ _id: id });
  return user;
};

export const getUsers = async (ids: string[]) => {
  const userCollection = await getUserCollection();
  const users = await userCollection.collection
    .find({ _id: { $in: ids } })
    .toArray();
  return users;
};

export const getTotalApplications = async (userId?: string) => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments(userId ? { applicantId: userId } : {});
  return totalApplications;
};

export const getApplicationsReviewedPercentage = async () => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments();
  const reviewedApplications =
    await applicationCollection.collection.countDocuments({
      status: { $in: [1, 2] },
    });

  const percentage = (reviewedApplications / totalApplications) * 100;
  return percentage;
};

export const getApplicationsStats = async () => {
  const applicationCollection = await getApplicationCollection();
  const totalApplications =
    await applicationCollection.collection.countDocuments();
  const approvedApplications =
    await applicationCollection.collection.countDocuments({ status: 1 });

  const deniedApplications =
    await applicationCollection.collection.countDocuments({ status: 2 });

  const approvedPercentage = (approvedApplications / totalApplications) * 100;
  const deniedPercentage = (deniedApplications / totalApplications) * 100;

  return { approved: approvedPercentage, denied: deniedPercentage };
};

export const getTotalStaffMembers = async () => {
  const userCollection = await getUserCollection();
  const staffMembers = await userCollection.collection.countDocuments({
    $or: [
      { roles: { $in: [DISCORD.STAFF_ROLE_ID, DISCORD.SUPERADMIN_ROLE] } },
      { access_level: { $gt: 0 } },
    ],
  });
  return staffMembers;
};

export const getApplicationStatusStats = async () => {
  const applicationCollection = await getApplicationCollection();
  const applicationStatusStats = await applicationCollection.collection
  .aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        results: { $push: { k: { $toString: "$_id" }, v: "$count" } }
      }
    },
    {
      $project: {
        _id: 0,
        results: { $arrayToObject: "$results" }
      }
    },
    {
      $project: {
        results: {
          $mergeObjects: [
            { "0": 0, "1": 0, "2": 0 },
            "$results"
          ]
        }
      }
    },
    {
      $replaceRoot: {
        newRoot: "$results"
      }
    }
  ])
  .toArray();

return applicationStatusStats.length > 0 ? applicationStatusStats[0] : { "0": 0, "1": 0, "2": 0 };
};

// interview utils
export const getTotalInterviews = async (userId?: string) => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments(userId ? { applicantId: userId } : {});
  return totalInterviews;
};

export const getInterviewsReviewedPercentage = async () => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments();
  const reviewedInterviews =
    await interviewCollection.collection.countDocuments({
      status: { $in: [1, 2] },
    });

  const percentage = (reviewedInterviews / totalInterviews) * 100;
  return percentage;
};

export const getInterviewStats = async () => {
  const interviewCollection = await getInterviewCollection();
  const totalInterviews = await interviewCollection.collection.countDocuments();
  const approvedInterviews =
    await interviewCollection.collection.countDocuments({ status: 1 });

  const deniedInterviews = await interviewCollection.collection.countDocuments({
    status: 2,
  });

  const approvedPercentage = (approvedInterviews / totalInterviews) * 100;
  const deniedPercentage = (deniedInterviews / totalInterviews) * 100;

  return { approved: approvedPercentage, denied: deniedPercentage };
};

export const getInterviewStatusStats = async () => {
  const interviewCollection = await getInterviewCollection();
  const interviewStatusStats = await interviewCollection.collection
    .aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          results: { $push: { k: { $toString: "$_id" }, v: "$count" } }
        }
      },
      {
        $project: {
          _id: 0,
          results: { $arrayToObject: "$results" }
        }
      },
      {
        $project: {
          results: {
            $mergeObjects: [
              { "0": 0, "1": 0, "2": 0 },
              "$results"
            ]
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: "$results"
        }
      }
    ])
    .toArray();
  
  return interviewStatusStats.length > 0 ? interviewStatusStats[0] : { "0": 0, "1": 0, "2": 0 };
  };

export const getInterviewsPerDay = async (startDate: Date, endDate: Date) => {
  const interviewCollectionObj = await getInterviewCollection();
  const interviewCollection = interviewCollectionObj.collection;

  const results = await interviewCollection
    .aggregate([
      {
        $match: {
          creationDate: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $toDate: "$creationDate",
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();

  // Helper function to add days to a date
  const addDays = (date: any, days: any) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Helper function to generate a date array between two dates
  const generateDateArray = (start: any, end: any) => {
    const dateArray = [];
    let currentDate = start;

    while (currentDate <= end) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate = addDays(currentDate, 1);
    }

    return dateArray;
  };

  const dateArray = generateDateArray(startDate, endDate);

  const lineChartData = dateArray.map((date) => {
    const interviewCount = results.find((result) => result._id === date)?.count || 0;
    return {
      date,
      count: interviewCount,
    };
  });

  return lineChartData;
};

export const getApplicationsPerDay = async (startDate: Date, endDate: Date) => {
  const applicationCollectionObj = await getApplicationCollection();
  const applicationCollection = applicationCollectionObj.collection;

  const results = await applicationCollection
    .aggregate([
      {
        $match: {
          submissionDate: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $toDate: "$submissionDate",
              },
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ])
    .toArray();

  // Helper function to add days to a date
  const addDays = (date: any, days: any) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Helper function to generate a date array between two dates
  const generateDateArray = (start: any, end: any) => {
    const dateArray = [];
    let currentDate = start;

    while (currentDate <= end) {
      dateArray.push(currentDate.toISOString().slice(0, 10));
      currentDate = addDays(currentDate, 1);
    }

    return dateArray;
  };

  const dateArray = generateDateArray(startDate, endDate);

  const lineChartData = dateArray.map((date) => {
    const applicationCount = results.find((result) => result._id === date)?.count || 0;
    return {
      date,
      count: applicationCount,
    };
  });

  return lineChartData;
};

export const createChangeLog = async (changeLog: ChangeLog) => {
  const changeLogCollection = await getChangeLogCollection();
  const res = await changeLogCollection.collection.insertOne({...changeLog, timestamp: Date.now()});

  return res;
};

export const getChangeLogById = async (id: string) => {
  const changeLogCollection = await getChangeLogCollection();
  try {
    const res = await changeLogCollection.collection.findOne({
      _id: new ObjectId(id),
    });

    return res;
  } catch (err) {
    return null;
  }
};

export const getAllChangeLogs = async () => {
  const changeLogCollection = await getChangeLogCollection();
  const res = await changeLogCollection.collection.find().toArray();

  return res;
};

export const getChangeLogsByUserId = async (userId: string) => {
  const changeLogCollection = await getChangeLogCollection();
  try {
    const res = await changeLogCollection.collection
      .find({ userId: userId })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getChangeLogsByFormType = async (formType: FormType) => {
  const changeLogCollection = await getChangeLogCollection();
  try {
    const res = await changeLogCollection.collection
      .find({ form: formType })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getChangeLogsByAction = async (action: Action) => {
  const changeLogCollection = await getChangeLogCollection();
  try {
    const res = await changeLogCollection.collection
      .find({ action: action })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const getChangeLogsByFormId = async (formId: string) => {
  const changeLogCollection = await getChangeLogCollection();
  try {
    const res = await changeLogCollection.collection
      .find({ formId: formId })
      .toArray();

    return res;
  } catch (err) {
    return null;
  }
};

export const updateChangeLog = async (
  id: string,
  updatedChangeLog: Partial<ChangeLog>
) => {
  const changeLogCollection = await getChangeLogCollection();
  const res = await changeLogCollection.collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedChangeLog }
  );

  return res;
};

export const deleteChangeLog = async (id: string) => {
  const changeLogCollection = await getChangeLogCollection();
  const res = await changeLogCollection.collection.deleteOne({
    _id: new ObjectId(id),
  });

  return res;
};

export function compareForms<T extends Record<string, any>>(
  oldForm: T,
  newForm: T
): FormActionChange[] {
  const changes: FormActionChange[] = [];

  for (const key in oldForm) {
    if (Object.prototype.hasOwnProperty.call(newForm, key)) {
      const oldValue = oldForm[key];
      const newValue = newForm[key];

      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        // Loop through the old array and compare elements with the new array
        oldValue.forEach((item: any, index: any) => {
          if (JSON.stringify(item) !== JSON.stringify(newValue[index])) {
            changes.push({
              field: key,
              index: index,
              previous: JSON.stringify(item),
              change: JSON.stringify(newValue[index]),
            });
          }
        });

        // Check for new elements added to the array
        if (newValue.length > oldValue.length) {
          for (let i = oldValue.length; i < newValue.length; i++) {
            changes.push({
              field: key,
              index: i,
              previous: 'undefined',
              change: JSON.stringify(newValue[i]),
            });
          }
        }
      } else if (!Array.isArray(oldValue) && !Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          changes.push({
            field: key,
            previous: JSON.stringify(oldValue),
            change: JSON.stringify(newValue),
          });
        }
      }
    }
  }

  return changes;
}