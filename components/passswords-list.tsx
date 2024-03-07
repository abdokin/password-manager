import React from "react";
import PasswordCard from "./password-card";
import { db } from "@/data";
import { passwordsTable } from "@/data/schema";


const PasswordsList = async () => {
  const passwordData = await db.select().from(passwordsTable);

  return (
    <div className="py-4">
      {passwordData.map((password, index) => (
        <PasswordCard {...password} key={index} />
      ))}
    </div>
  );
};

export default PasswordsList;
