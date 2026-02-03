import styles from './Loading.module.css'

export default function Loading() {
    
    return (
        // className={styles.ldsFacebook}
        <div className={styles.loadingParent}>    
            <div className={styles.loader}></div>
        </div>
    )
}
