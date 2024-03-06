import React from "react";
import PasswordCard from "./password-card";

const generateRandomSlug = () => {
  const adjectives = ["happy", "secret", "mysterious", "awesome", "sunny"];
  const nouns = ["cat", "dog", "unicorn", "dragon", "moon"];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${randomAdjective}-${randomNoun}`;
};

const generateRandomUrl = () => {
  const domains = [
    "example1.com",
    "example2.com",
    "example3.com",
    "example4.com",
    "example5.com",
  ];

  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  return `https://${randomDomain}`;
};

const generateRandomPasswordData = () => {
  return Array.from({ length: 20 }, (_, index) => ({
    url: generateRandomUrl(),
    slug: generateRandomSlug(),
  }));
};

const PasswordsList = () => {
  const passwordData = generateRandomPasswordData();

  return (
    <div className="py-4">
      {passwordData.map((password, index) => (
        <PasswordCard {...password} key={index} />
      ))}
    </div>
  );
};

export default PasswordsList;
