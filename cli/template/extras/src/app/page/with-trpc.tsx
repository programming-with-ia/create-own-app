import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            Create <span className={styles.pinkSpan}>OWN</span> App
          </h1>
          <div className={styles.cardRow}>
            <Link
              className={styles.card}
              href="https://own-app.oimmi.com/usage/first-steps"
              target="_blank"
            >
              <h3 className={styles.cardTitle}>First Steps →</h3>
              <div className={styles.cardText}>
                Just the basics - Everything you need to know to set up your
                database and authentication.
              </div>
            </Link>
            <Link
              className={styles.card}
              href="https://own-app.oimmi.com/introduction"
              target="_blank"
            >
              <h3 className={styles.cardTitle}>Documentation →</h3>
              <div className={styles.cardText}>
                Learn more about Create OWN App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
          </div>
          <div className={styles.showcaseContainer}>
            <p className={styles.showcaseText}>
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
          </div>

          <LatestPost />
        </div>
      </main>
    </HydrateClient>
  );
}
