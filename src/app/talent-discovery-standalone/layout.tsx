import SessionActivityHeartbeat from "./SessionActivityHeartbeat";

export default function TalentDiscoveryStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionActivityHeartbeat />
      {children}
    </>
  );
}
