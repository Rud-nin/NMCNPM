import styles from "./Overlay.module.css";

export default function Overlay({ children }) {
    return (
        <div className={styles.overlay}>
            {children}
        </div>
    );
}