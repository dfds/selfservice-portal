import styles from "./Nope.module.css";
import image from "./404.gif";

export default function Nope() {
  return (
    <>
      <div className="h-8" />
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className={styles.nope}>
          <div className={styles.column}>
            <div
              style={{ fontSize: "10rem" }}
              className="font-bold text-[#002b45] leading-none"
            >
              Nope!
            </div>
            <div className="text-xl text-[#002b45]">Not for you</div>
          </div>
          <div className={styles.column}>
            <img src={image} alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
