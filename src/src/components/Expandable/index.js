import styles from "./expandable.module.css";

export default function Expandable({header, isOpen, onHeaderClicked, children}) {
    const clickHandler = () => {
        if (onHeaderClicked) {
            onHeaderClicked();
        }
    };

    return <div className={styles.container}>
        <div className={styles.header} onClick={clickHandler}>
            {header}
        </div>
        { isOpen && 
            <div className={styles.content}>
                {children}
            </div>
        }
    </div>
}