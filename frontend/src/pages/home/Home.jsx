import styles from "./Home.module.css";

function FeatureCard({image, text}) {
    return (
        <div className={styles.featureCard}>
            <div>{image || null}</div>
            <p>{text || null}</p>
        </div>
    );
}

function ContactCard({image, text}) {
    return (
        <div className={styles.contactCard}>
            <div>{image || null}</div>
            <p>{text || null}</p>
        </div>
    );
}

export default function Home() {
    return (
        <>
            <header className={styles.header}>
                {/* Navigation */}
                <div className={styles.width1020px}>
                    <div>
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-DH-Bach-Khoa-Ha-Noi-HUST-768x1155.png" alt="Hust logo" />
                        <div>
                            Đại học Bách Khoa Hà Nội<br/>
                            <span className={styles.fontSize09}>Hệ thống quản lý chung cư - KTX Ehust-max</span>
                        </div>
                    </div>

                    <nav>
                        <ul>
                            <li><a href="#">Tổng quan</a></li>
                            <li><a href="#">Tính năng</a></li>
                            <li><a href="#">Về chúng tôi</a></li>
                            <li><a href="#">Đăng nhập</a></li>
                        </ul>
                    </nav>
                </div>
            </header>

            <main className={styles.main}>
                <section className={`${styles.overview} ${styles.width1020px}`}>
                    {/* Overview section */}
                    <div>
                        <img src="https://soict.hust.edu.vn/wp-content/uploads/logo-soict-hust-1-1024x416.png" alt="Hust logo" />
                    </div>
                    <h1>Hệ thống quản lý chung cư - KTX Ehust-max</h1>
                    <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Iure, sint reiciendis cupiditate alias optio est quos aut, illo harum ducimus modi laudantium velit laboriosam ratione illum earum tempora similique quo!</p>
                    <button>Đăng nhập</button>
                </section>

                <section className={styles.features}>
                    <div className={styles.width1020px}>
                        {/* Features section */}
                        <div>
                            {/* Admin features */}
                            <h2>Dành cho người quản lý</h2>
                            <div className={styles.cardContainer}>
                                <FeatureCard 
                                    image={<i className="fa-solid fa-gear"></i>}
                                    text="Công cụ quản lý thuật tiện, mạnh mẽ, tập trung dữ liệu"
                                />
                                <FeatureCard 
                                    image={<i className="fa-solid fa-chart-pie"></i>}
                                    text="Báo cáo chính xác, trực quan, tổng hợp đầy đủ"
                                />
                                <FeatureCard 
                                    image={<i className="fa-solid fa-headset"></i>}
                                    text="Hỗ trợ kĩ thuật sẵn sàng 24/7"
                                />
                            </div>
                        </div>
                        <div>
                            {/* End users features */}
                            <h2>Dành cho người dùng</h2>
                            <div className={styles.cardContainer}>
                                <FeatureCard 
                                    image={<i className="fa-regular fa-user"></i>}
                                    text="Giao diện thân thiện, dễ dùng, dễ tiếp cận"
                                />
                                <FeatureCard 
                                    image={<i className="fa-solid fa-money-check-dollar"></i>}
                                    text="Dễ dàng kiểm tra các dịch vụ, phí, thông báo của ban quản lý"
                                />
                                <FeatureCard 
                                    image={<i className="fa-solid fa-user-shield"></i>}
                                    text="Đảm bảo an ninh, an toàn dữ liệu"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <section className={styles.width1020px}>
                    {/* Contact section */}
                    <h2>Về chúng tôi</h2>
                    <div className={styles.cardContainer}>
                        <ContactCard 
                            image={<i className="fa-solid fa-user"></i>}
                            text="Bùi Duy Ninh"
                        />
                        <ContactCard 
                            image={<i className="fa-solid fa-user"></i>}
                            text="Trịnh Hoàng Giang"
                        />
                        <ContactCard 
                            image={<i className="fa-solid fa-user"></i>}
                            text="Vũ Công Tấn"
                        />
                        <ContactCard 
                            image={<i className="fa-solid fa-user"></i>}
                            text="Chu Văn Sơn"
                        />
                    </div>
                </section>
                
            </main>

            <footer className={styles.footer}>
                &copy; Bài tập lớn Nhập môn Công nghệ phần mềm - IT3180 - 162273 - Nhóm 16
            </footer>
        </>
    );
}