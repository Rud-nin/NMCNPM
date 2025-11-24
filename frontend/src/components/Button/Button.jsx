import styles from './Button.module.css'

function Button({ children, onClick = () => console.log('button clicked') }) {
  return (
    <button onClick={onClick} className={styles.button}>
      {children}
    </button>
  )
}

export default Button;
