import { useEffect, useState } from "react";
import { useUsersStore } from "../../stores/useUsersStore";
import Button from "../Button/Button";
import Overlay from "../Overlay/Overlay";
import Table from "../Table/Table";
import Pagination from "../Pagination/Pagination";
import styles from "./UserManagement.module.css";

export default function UserManagement() {
    // const { users, getUsers, getUserById, updateUser, deleteUser } = useUsersStore();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(null);
    const [selectingUser, setSelectingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [services, setServices] = useState([]);
    
    const [searchName, setSearchName] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(1);

    const handleFetchUsers = async () => {
        /*
         * Dữ liệu tạm thời để hiển thị trong khi đợi be
         * Thay thế đoạn dưới khi be có api
         */
        console.log("TODO: Handle Fetch Users");
        const [users, rooms, services] = await Promise.all([
            fetch("users.example.json").then(res => res.json()),
            fetch("rooms.example.json").then(res => res.json()),
            fetch("services.example.json").then(res => res.json()),
        ]);
        setUsers(users);
        setRooms(rooms.map(room => room.name));
        setServices(services);
    }

    const handleCreateUser = () => {
        console.log("TODO: Handle Create User");
    }

    const handleSearchUsername = () => {
        console.log("TODO: Handle Search Username");
    }

    const handleUpdateUser = () => {
        console.log("TODO: Handle Update User");
    }

    const handleDeleteUser = () => {
        console.log("TODO: Handle Delete User");
    }

    const handleModelConfirm = () => {
        if (newUser) {
            handleCreateUser();
        } else if (selectingUser) {
            handleUpdateUser();
        }
        setNewUser(null);
        setSelectingUser(null);
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
                        Username: "",
                        Email: "",
                        Phone: "",
                        Room: "",
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
                        <th>Stt</th>
                        <th>Người dùng</th>
                        <th>Phòng</th>
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
                                {user.Room ?? "Chưa được xếp"}
                            </td>
                            <td>
                                <div className={styles.buttonContainer}>
                                    <Button
                                        onClick={() => setSelectingUser({
                                            ...user,
                                            services: [...user.services],
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

            {(newUser || selectingUser) && !deletingUser && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>
                            {newUser ? "Thêm người dùng mới" : "Sửa thông tin người dùng"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Tên người dùng"
                            value={newUser?.Username || selectingUser?.Username || ""}
                            onChange={(e) => newUser ?
                                setNewUser({...newUser, Username: e.target.value}) :
                                setSelectingUser({...selectingUser, Username: e.target.value})} />
                        <input
                            type="text"
                            placeholder="Email người dùng"
                            value={newUser?.Email || selectingUser?.Email || ""}
                            onChange={(e) => newUser ?
                                setNewUser({...newUser, Email: e.target.value}) :
                                setSelectingUser({...selectingUser, Email: e.target.value})} />
                    
                        <input
                            type="text"
                            placeholder="Sđt người dùng"
                            value={newUser?.Phone || selectingUser?.Phone || ""}
                            onChange={(e) => newUser ?
                                setNewUser({...newUser, Phone: e.target.value}) :
                                setSelectingUser({...selectingUser, Phone: e.target.value})} />

                        <select
                            value={newUser?.Room || selectingUser?.Room || ""}
                            onChange={(e) => newUser ?
                                setNewUser({...newUser, Room: e.target.value}) :
                                setSelectingUser({...selectingUser, Room: e.target.value})}
                        >
                            <option value="">Phòng</option>
                            {rooms.map((room, index) => (
                                <option key={index} value={room}>
                                    {room}
                                </option>
                            ))}
                        </select>

                        <div className={styles.services}>
                            {services.map((service, index) => (
                                <button
                                    key={index}
                                    className={newUser ? (
                                        newUser.services.includes(service) ? styles.selected : ""
                                    ) : (
                                        selectingUser.services.includes(service) ? styles.selected : ""
                                    )}
                                    onClick={() => {
                                        if (newUser) {
                                            if (!newUser.services.includes(service))
                                                setNewUser({
                                                    ...newUser,
                                                    services: [...newUser.services, service]
                                                });
                                            else
                                                setNewUser({
                                                    ...newUser,
                                                    services: newUser.services.filter(s => s != service)
                                                });
                                        } else {
                                            if (!selectingUser.services.includes(service))
                                                setSelectingUser({
                                                    ...selectingUser,
                                                    services: [...selectingUser.services, service]
                                                });
                                            else
                                                setSelectingUser({
                                                    ...selectingUser,
                                                    services: selectingUser.services.filter(s => s != service)
                                                });
                                        }
                                    }}
                                >
                                    {service}
                                </button>
                            ))}
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button
                                onClick={handleModelConfirm}
                            >
                                {newUser ? "Thêm" : "Lưu"}
                            </Button>
                            {selectingUser && (
                                <Button onClick={(e) => setDeletingUser(selectingUser)}>
                                    Xóa
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    setNewUser(null);
                                    setSelectingUser(null);
                                    setDeletingUser(null);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
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