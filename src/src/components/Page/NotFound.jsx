import styles from "./NotFound.module.css";
import image from "./404.gif";

export default function NotFound() {
  return (
    <>
      <div className="h-8" />
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className={styles.notfound}>
          <div className={styles.column}>
            <div style={{ fontSize: "10rem" }} className="font-bold text-[#002b45] dark:text-white leading-none">
              404
            </div>
            <div className="text-xl text-[#002b45] dark:text-white">Page Not Found!</div>
          </div>
          <div className={styles.column}>
            <img src={image} alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
