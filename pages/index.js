import Head from "next/head";
import Image from "next/image";
import Table from "../components/table";
import CurrentMatch from "../components/views/CurrentMatch/CurrentMatch";
import {
  ENVIRONMENT,
  setClientenvsInSession,
  CLIENT_ENVIRONMENT,
  CONSTANTS,
} from "../lib/util";
import styles from "../styles/Home.module.css";
import useDashboard from "../hooks/useDashboard";
import { axiosClient } from "../lib/apiClient";
import { useState } from "react";

export default function Home({
  initalDashboard,
  leagues,
  clientenvs,
  initalTeamsData,
}) {
  const leagueInView = leagues?.filter((l) => l.default)[0];
  const [league, setLeague] = useState(leagueInView);
  const { view, teams, currentMatch } = useDashboard({
    initalDashboard,
    clientenvs,
    league,
    initalTeamsData,
  });

  const dashboardView = () => {
    if (view === CONSTANTS.VIEWS.STANDINGS) {
      return <Table teams={teams} />;
    } else {
      return <CurrentMatch match={currentMatch} matchView={view} />;
    }
  };

  return (
    <div className={styles.container + " " + "standings-container"}>
      <Head>
        <title>{league && league["name"]}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container-fluid d-flex flex-column align-items-center dashBoard-container">
        <div className="d-flex justify-content-center w-100 py-4">
          <h1>{league && league["name"]}</h1>
        </div>

        {dashboardView()}
      </main>
      {/* 
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created By{" "}
          <span className={styles.logo}>
            <Image
              src="/melkorCba-react.png"
              alt="Vercel Logo"
              width={72}
              height={16}
            />
          </span>
        </a>
      </footer> */}
    </div>
  );
}

export async function getServerSideProps(context) {
  // Fetch data from external API
  const envs = CLIENT_ENVIRONMENT;
  const axios = axiosClient(context.req);

  try {
    const dashboardResponse = await axios.get(`api/dashboard`);
    const leagueResponse = await axios.get(`api/leagues`);
    const teamsResponse = await axios.get(`api/teams`);
    const initalDashboardData = await dashboardResponse["data"];
    const initalTeamsData = await teamsResponse["data"];
    const leagues = await leagueResponse["data"];
    return {
      props: {
        initalDashboard: initalDashboardData["data"],
        leagues: leagues["data"],
        initalTeamsData: initalTeamsData["data"],
        clientenvs: envs,
      },
    };
  } catch (err) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // Pass data to the page via props
}
