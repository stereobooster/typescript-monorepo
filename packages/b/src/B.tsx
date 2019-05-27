import React from "react";

export type BProps = {};

export const B: React.FC<BProps> = ({ children }) => {
  return <div>B: {children}</div>;
};

// B.defaultProps = {};
// B.propTypes = {};
B.displayName = "B";
