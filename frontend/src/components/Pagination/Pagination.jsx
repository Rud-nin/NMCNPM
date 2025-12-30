import styles from "./Pagination.module.css"

export default function Pagination({
    page,
    setPage,
    limit,
    setLimit,
    total,
}) {
    return (
        <div className={styles.pagination}>
            <div>
                <button
                    onClick={() => setPage(page > 1 ? page - 1 : page)}
                    disabled={page === 1}
                >
                    &lt;
                </button>
                <span>
                    {page} / {total}
                </span>
                <button
                    onClick={() => setPage(page < total ? page + 1 : page)}
                    disabled={page === total}
                >
                    &gt;
                </button>
            </div>
            <div>
                Hiển thị:
                <select value={limit} onChange={(e) => setLimit(e.target.value)}>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    )
}