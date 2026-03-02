import NotFound from "./NotFound";
import { Spinner } from "@/components/ui/spinner";
import styles from "./page.module.css";

export default function Page({ title, isLoading = false, isNotFound = false, children }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <div className="p-4 sm:p-8">
      {title && (
        <h1 className={styles.pageTitle}>
          {title}
        </h1>
      )}
      {children}
    </div>
  );
}
