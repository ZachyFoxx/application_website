import React from "react";
import Image from "next/image";
import { Application, convertStatus, Interview, User } from "src/types";
import moment from "moment";
import UserGradient from "../user/UserGradient";
import Container from "../Container";

interface ApplicationProps {
  form: {
    _id: string;
    status: number;
    lastUpdate: number;
    collection: string;
    applicantId: string;
  };
  applicant: User;
}

const RecentBar: React.FC<ApplicationProps> = ({ form, applicant }) => {
  function truncate(str: string, maxLength = 19) {
    if (str.length <= maxLength) {
      return str;
    }
    return str.slice(0, maxLength - 3) + "...";
  }

  return (
    <>
      <Container className="p-4 my-3 rounded-xl shadow-lg items-center space-x-1">
        <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center p-1 w-64">
            <div
              className="rounded-full mr-2 relative overflow-hidden"
              style={{ width: 36, height: 36 }}
            >
              <Image
                src={applicant.avatar}
                alt="User Avatar"
                height={36}
                width={36}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-thin text-lg">
                {truncate(applicant.nick ? applicant.nick : applicant.username)}
              </h1>
              <h1 className="text-sm">
                <UserGradient user={applicant} />
              </h1>
            </div>
          </div>
          <div className="flex flex-row items-center">
            <h1 className="text-gray-500 text-sm">
              {form.collection === "applications" ? (
                <span className="text-blue-400">{form.collection}</span>
              ) : (
                <span className="text-yellow-400">{form.collection}</span>
              )}
            </h1>
          </div>

          <div className="flex flex-row items-center px-8">
            <p
              className={`${
                form?.status === 0
                  ? "text-gray-500"
                  : form?.status === 1
                  ? "text-green-500"
                  : "text-red-500"
              } text-md`}
            >
              {convertStatus(form?.status as number)}
            </p>
          </div>
        </div>
      </Container>
    </>
  );
};

export default RecentBar;
