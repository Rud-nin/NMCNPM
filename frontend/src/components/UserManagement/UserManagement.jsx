import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUsersStore } from "../../stores/useUsersStore";
import { useServiceStore } from "../../stores/useServiceStore";
import Button from "../Button/Button";
import Overlay from "../Overlay/Overlay";
import Table from "../Table/Table";
import Pagination from "../Pagination/Pagination";
import styles from "./UserManagement.module.css";

function UserDetail({ UserID, cancel, confirm, remove }) {
    // Tách ra component nữa để gọi useEffect
    const [user, setUser] = useState(null);
    const { getUserById } = useUsersStore();
    const { services } = useServiceStore();

    useEffect(() => {
        getUserById(UserID)
            .then(res => {
                res.BirthDate = res.BirthDate.split("T")[0];
                res.services = res.services ?? [];
                setUser(res);
            })
    }, []);

    return (
        <div className={styles.modal}>
            <h2>Thông tin người dùng</h2>

            <input
                type="text"
                placeholder="Tên người dùng"
                value={user?.FullName || ""}
                onChange={(e) => setUser({...user, FullName: e.target.value})}/>

            <input
                type="text"
                placeholder="Email người dùng"
                value={user?.Email || ""}
                onChange={(e) => setUser({...user, Email: e.target.value})}/>

            <input
                type="text"
                placeholder="CCCD"
                value={user?.ID || ""}
                onChange={(e) => setUser({...user, ID: e.target.value})}/>

            <input
                type="text"
                placeholder="MSSV"
                value={user?.StudentID || ""}
                onChange={(e) => setUser({...user, StudentID: e.target.value})} />

            <input
                className={styles.oneCell}
                type="date"
                placeholder="Ngày sinh"
                value={user?.BirthDate || ""}
                onChange={(e) => setUser({...user, BirthDate: e.target.value})}/>

            <select
                className={styles.oneCell}
                value={user?.Role ?? "user"}
                onChange={(e) => setUser({...user, Role: e.target.value})}
            >
                <option value="user">Người dùng</option>
                <option value="admin">Quản trị viên</option>
            </select>
            
            <div>
                ID Phòng: {user?.RoomID || "Chưa được xếp"}
            </div>

            <div className={styles.services}>
                {services.map((service) => (
                    <button
                        key={service.ServiceID}
                        className={
                            user?.services.includes(service.ServiceID) ? styles.selected : ""
                        }
                        onClick={() =>
                        setUser(prev => ({
                            ...prev,
                            services: prev.services.includes(service.ServiceID)
                            ? prev.services.filter(s => s !== service.ServiceID)
                            : [...prev.services, service.ServiceID],
                        }))}
                    >
                        {service.ServiceName}
                    </button>
                ))}
            </div>

            <div className={styles.buttonContainer}>
                <Button onClick={() => confirm(user) }>
                    Lưu
                </Button>
                <Button onClick={remove}>
                    Xóa
                </Button>
                <Button onClick={cancel}>
                    Hủy
                </Button>
            </div>
        </div>
    )
}

export default function UserManagement() {
    const { users, getUsers, updateUser, deleteUser, createUser } = useUsersStore();
    // const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(null);
    const [selectingUser, setSelectingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    // const [services, setServices] = useState([]);

    const { services } = useServiceStore(); 
    
    const [searchName, setSearchName] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(1);

    const handleFetchUsers = async () => {
        /*
         * Dữ liệu tạm thời để hiển thị trong khi đợi be
         * Thay thế đoạn dưới khi be có api
         */
        // console.log("TODO: Handle Fetch Users");
        // const [users, rooms, services] = await Promise.all([
        //     fetch("users.example.json").then(res => res.json()),
        //     fetch("rooms.example.json").then(res => res.json()),
        //     fetch("services.example.json").then(res => res.json()),
        // ]);
        // setUsers(users.data);
        // setRooms(rooms);
        // setServices(services);

        const res = await getUsers(page, limit);
        if (res) {
            const { pagination } = res;
            setTotal(pagination.totalPages);
        }
    }

    const handleCreateUser = async () => {
        if (newUser) {
            if (!newUser.FullName ||
                !newUser.Email ||
                !newUser.Password ||
                !newUser.BirthDate ||
                !newUser.StudentID ||
                !newUser.ID ||
                !newUser.Role
            ) return toast.error("Vui lòng điền đầy đủ thông tin");
            await createUser(newUser);
            setNewUser(null);
        }
    }

    const handleSearchUsername = () => {
        console.log("TODO: Handle Search Username");
    }

    const handleUpdateUser = async (selectingUser) => {
        if (selectingUser) {
            if (!selectingUser.FullName ||
                !selectingUser.Email ||
                !selectingUser.BirthDate ||
                !selectingUser.StudentID ||
                !selectingUser.ID ||
                !selectingUser.Role
            ) return toast.error("Vui lòng điền đầy đủ thông tin");
            await updateUser(selectingUser.UserID, selectingUser);
            setSelectingUser(null);
        }
    }

    const handleDeleteUser = async () => {
        if (deletingUser) {
            await deleteUser(deletingUser.UserID);
            setSelectingUser(null);
            setDeletingUser(null);
        }
    }

    useEffect(() => {
        handleFetchUsers();
    }, [limit, page]);

    return (
        <div className={styles.userReport}>
            <header>
                <h2>Quản lý người dùng</h2>
                <Button
                    onClick={() => setNewUser({
                        FullName: "",
                        Email: "",
                        Password: "",
                        BirthDate: "",
                        StudentID: "",
                        ID: "",
                        Role: "",
                        RoomID: "",
                        services: [],
                    })}
                >
                    + Thêm người dùng mới
                </Button>
            </header>

            <div className={styles.search}>
                <input
                    type="text"
                    placeholder="Tìm kiếm tên người dùng"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                />

                <span className={styles.buttonContainer}>
                    <Button
                        onClick={handleSearchUsername}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                        {' '}
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={handleFetchUsers}
                    >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        {' '}
                        Làm mới
                    </Button>
                </span>
            </div>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Vai trò</th>
                        <th>ID Phòng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={index}>
                            <td>{user.UserID || (index + 1)*page}</td>
                            <td>
                                <div>
                                    {user.FullName}
                                    <br/>
                                    {user.Email}
                                </div>
                            </td>
                            <td>
                                {user.Role === "Admin" ? "Quản trị viên" : "Người dùng"}
                            </td>
                            <td>
                                {user.RoomID ?? "Chưa được xếp"}
                            </td>
                            <td>
                                <div className={styles.buttonContainer}>
                                    <Button
                                        onClick={() => setSelectingUser({
                                            ...user,
                                            services: [...(user.services || [])],
                                        })}
                                    >
                                        <i className="fa-solid fa-user-pen"></i>
                                    </Button>
                                    <Button
                                        onClick={() => setDeletingUser(user)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className={styles.paginationContainer}>
                <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}/>
            </div>

            {newUser && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>Thêm người dùng mới</h2>

                        <input
                            type="text"
                            placeholder="Tên người dùng"
                            value={newUser?.FullName ?? ""}
                            onChange={(e) => setNewUser({...newUser, FullName: e.target.value})} />
                        <input
                            type="text"
                            placeholder="Email người dùng"
                            value={newUser?.Email ?? ""}
                            onChange={(e) => setNewUser({...newUser, Email: e.target.value})} />
                    
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            value={newUser?.Password ?? ""}
                            onChange={(e) => setNewUser({...newUser, Password: e.target.value})} />

                        <input
                            type="text"
                            placeholder="MSSV"
                            value={newUser?.StudentID ?? ""}
                            onChange={(e) => setNewUser({...newUser, StudentID: e.target.value})} />
                        <input
                            type="text"
                            placeholder="CCCD"
                            value={newUser?.ID ?? ""}
                            onChange={(e) => setNewUser({...newUser, ID: e.target.value})} />

                        <input
                            className={styles.oneCell}
                            type="date"
                            placeholder="Ngày sinh"
                            value={newUser?.BirthDate ?? ""}
                            onChange={(e) => setNewUser({...newUser, BirthDate: e.target.value})} />

                        <select
                            className={styles.oneCell}
                            value={newUser.Role ?? "user"}
                            onChange={(e) => setNewUser({...newUser, Role: e.target.value})}
                        >
                            <option value="user">Người dùng</option>
                            <option value="admin">Quản trị viên</option>
                        </select>

                        <div>
                            ID Phòng: {newUser?.RoomID || "Chưa được xếp"}
                        </div>

                        <div className={styles.services}>
                            {services.map((service, index) => (
                                <button
                                    key={index}
                                    className={newUser.services.includes(service) ? styles.selected : ""}
                                    onClick={() => setNewUser(newUser.services.includes(service) ?
                                        newUser.services.filter(s => s != service) :
                                        [...newUser.services, service]
                                    )}
                                >
                                    {service.ServiceName}
                                </button>
                            ))}
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button
                                onClick={handleCreateUser}
                            >
                                Thêm
                            </Button>
                            <Button
                                onClick={() => setNewUser(null)}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </Overlay>
            )}

            {selectingUser && (
                <Overlay>
                    <UserDetail
                        UserID={selectingUser.UserID}
                        cancel={() => setSelectingUser(null)}
                        confirm={handleUpdateUser}
                        remove={() => setDeletingUser(selectingUser)}
                    />
                </Overlay>
            )}

            {deletingUser && (
                <Overlay>
                    <div className={styles.deleteModal}>
                        <h2>Xóa người dùng {deletingUser.Username}?</h2>
                        <Button onClick={handleDeleteUser}>
                            Xóa
                        </Button>
                        <Button onClick={() => setDeletingUser(null)}>
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}
        </div>
    )
}