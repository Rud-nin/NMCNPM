import { useEffect, useState } from "react";
import styles from "./RoomSelecting.module.css";

export default function RoomSelecting() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recommended");

  /*
   * Hàm xử lý logic chọn phòng của người dùng
   * Dùng bởi nút ở gần cuối component
   * Gửi yêu cầu chọn phòng về backend và sau khi thành công chuyển hướng sang trang tiếp theo
   * thông tin về phòng được chọn được lưu ở biến selectedRoom bên trên
   * ví dụ backend yêu cầu gửi qua /api/room/:id/apply
   * hàm triển khai ví dụ:
   * if (!selectedRoom) return toast.error("Chưa có phòng được chọn!");
   * try {
   *   await applyRoom(selectedRoom.id); // hàm lấy trong store liên quan về room
   *   toast.success("Đã gửi yêu cầu đăng ký phòng thành công! Vui lòng chờ xác nhận của admin");
   * } catch (error) {
   *   toast.error(error.message);
   * }
   * 
   * Thay thế logic vào hàm bên dưới
   */
  const handleSelectRoom =  () => {
    console.log("TODO: Gửi yêu cầu về chọn phòng về backend và chuyển hướng");
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const tryFetch = (path) =>
      fetch(path).then((res) => {
        if (!res.ok) throw new Error("not ok");
        return res.json();
      });


    /*
     * Fetch dữ liệu bằng cách thay đoạn dưới đây bằng gọi store
     * Thay dữ liệu đã fetch thành công vào biến rooms qua setRooms
     */

    Promise.any([tryFetch("/rooms.example.json"), tryFetch("./rooms.example.json")])
      .then((data) => {
        if (!mounted) return;
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          "Couldn't load rooms.json. Put rooms.json in your public folder or adjust the path."
        );
        setLoading(false);
      });

    /*
     * Kết thúc fetch dữ liệu 
     */

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // close modal on Escape
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedRoom(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = rooms
    .filter((r) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) || (r.description || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.pricePerMonth - b.pricePerMonth;
      if (sort === "price-desc") return b.pricePerMonth - a.pricePerMonth;
      if (sort === "least-occupied") return a.occupantsCount / a.capacity - b.occupantsCount / b.capacity;
      // recommended: show rooms with more free space first, then cheaper
      const freeA = a.capacity - a.occupantsCount;
      const freeB = b.capacity - b.occupantsCount;
      if (freeA !== freeB) return freeB - freeA;
      return a.pricePerMonth - b.pricePerMonth;
    });

  /*
   * Ngăn người dùng truy cập trang này nếu đã được phân phòng tại đây
   * Giống như 1 protected route vậy
   * Ví dụ:
   * if(user.room)
   *   return <Navigate to="/user" />;
   * 
   * Viết trực tiếp logic bảo vệ tại đây hoặc 1 component mới
   * Return dưới dùng chỉ để người dùng hợp lệ để chọn phòng mới hiện trang này
   */

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chọn một phòng</h1>
        <p className={styles.subtitle}>Danh sách các phòng khả dụng</p>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              placeholder="Tìm theo tên hoặc mô tả..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search rooms"
            />
          </div>

          <div className={styles.selectWrap}>
            <label className={styles.visuallyHidden} htmlFor="sort">Sort</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={styles.select}
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="least-occupied">Most Free Space</option>
            </select>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className={`${styles.card} ${styles.skeleton}`} aria-busy>
                <div className={styles.skelHeader} />
                <div className={styles.skelRow} />
                <div className={styles.skelRowShort} />
                <div className={styles.skelFooter} />
              </article>
            ))}
          </div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.grid}>
            {filtered.length === 0 && (
              <div className={styles.noResults}>
                No rooms match your search. Try changing filters.
              </div>
            )}

            {filtered.map((room) => (
              <article
                key={room.id}
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedRoom(room)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedRoom(room)}
                aria-label={`Open details for ${room.name}`}
              >
                <div className={styles.cardMedia} aria-hidden>
                  {/* placeholder image area */}
                  <div className={styles.placeholderImg}>{room.name.charAt(0)}</div>
                </div>

                {/*
                  * Thay các giá trị để hiển thị, ví dụ backend trả về room.Name chẳng hạn
                  * thì thay room.name -> room.Name ở vài dòng dưới
                  * trả về room.Price thì thay room.pricePerMonth -> room.Price
                  */}

                <div className={styles.cardBody}>
                  <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardTitle}>{room.name}</h3>
                    <div className={styles.price}>${room.pricePerMonth.toLocaleString()}/mo</div>
                  </div>

                  <p className={styles.cardDesc} title={room.description}>{
                    room.description.length > 100 ? room.description.slice(0, 100) + '…' : room.description
                  }</p>

                  <div className={styles.cardMeta}>
                    <div className={styles.occupancy}>
                      <strong>{room.occupantsCount}</strong>
                      <span>/</span>
                      <span>{room.capacity}</span>
                      <span className={styles.metaLabel}> thành viên</span>
                    </div>

                    <div className={styles.capacityBadge}>
                      {room.capacity - room.occupantsCount > 0 ? (
                        <span className={styles.open}>Còn trống</span>
                      ) : (
                        <span className={styles.full}>Đầy phòng</span>
                      )}
                    </div>
                  </div>

                  {/*
                    * Kết thúc thay dữ liệu
                    */}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selectedRoom && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRoom(null);
          }}
        >
          <div className={styles.modal}>
            {/*
              * Tiếp tục thay dữ liệu
              */}
            <header className={styles.modalHeader}>
              <h2 id="room-title">{selectedRoom.name}</h2>
              <button className={styles.close} onClick={() => setSelectedRoom(null)} aria-label="Close">
                ×
              </button>
            </header>

              <div className={styles.modalBody}>
              <p className={styles.modalPrice}>${selectedRoom.pricePerMonth.toLocaleString()}/month</p>

              <p className={styles.modalDesc}>{selectedRoom.description}</p>

              <div className={styles.amenities}>
                <h4>Dịch vụ chung</h4>
                <ul>
                  {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                    selectedRoom.amenities.map((a, i) => <li key={i}>{a}</li>)
                  ) : (
                    <li>Không có dịch vụ</li>
                  )}
                </ul>
              </div>

              <div className={styles.detailsRow}>
                <div>
                  <strong>Thành viên</strong>
                  <div>
                    {selectedRoom.occupantsCount} / {selectedRoom.capacity}
                  </div>
                </div>

                <div>
                  <strong>Khả dụng</strong>
                  <div>{selectedRoom.availableFrom ?? "Bây giờ"}</div>
                </div>
              </div>
            </div>
            {/*
              * Kết thúc thay dữ liệu
              */}

            <footer className={styles.modalFooter}>
              <button
                onClick={handleSelectRoom}
                className={styles.choose}
              >
                Chọn phòng này
              </button>

              <button className={styles.secondary} onClick={() => setSelectedRoom(null)}>
                Hủy
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
