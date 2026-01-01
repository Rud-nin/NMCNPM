import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Table from "../Table/Table";
import Pagination from "../Pagination/Pagination";
import Overlay from "../Overlay/Overlay";
import styles from "./RoomManagement.module.css";

export default function RoomManagement() {
    const [displayMode, setDisplayMode] = useState("table"); // table | grid

    const [rooms, setRooms] = useState([]);
    const [newRoom, setNewRoom] = useState(null);
    const [selectingRoom, setSelectingRoom] = useState(null);
    const [deletingRoom, setDeletingRoom] = useState(null);

    const [services, setServices] = useState([]);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(1);

    const [newEmployee, setNewEmployee] = useState(null);
    const [users, setUsers] = useState([]);

    const handleFetchRooms = () => {
        console.log("TODO: handle fetch rooms");
        (async () => {
            const [rooms, services] = await Promise.all([
                fetch("rooms2.example.json").then(res => res.json()),
                fetch("services2.example.json").then(res => res.json()),
            ]);
            setRooms(rooms);
            setServices(services);
        })();
    }

    const handleSearchRooms = () => {
        console.log("TODO: handle search rooms");
    }

    const handleAddRoom = () => {
        console.log("TODO: handle add room");
    }

    const handleUpdateRoom = () => {
        console.log("TODO: handle update room");
    }

    const handleDeleteRoom = () => {
        console.log("TODO: handle delete room");
    }

    const handleSearchUsers = () => {
        console.log("TODO: handle search users");
    }

    const handleAddUserToRoom = (room, user) => {
        console.log("TODO: add user to room");
    }

    const handleRemoveUserFromRoom = (room, user) => {
        console.log("TODO: remove user from room");
    }

    useEffect(() => {
        handleFetchRooms();
    }, [limit, page]);

    return (
        <div className={styles.roomManagement}>
            <header>
                <h2>Quản lý phòng</h2>
                <Button
                    onClick={() => setNewRoom({
                        services: [],
                        employee: 0,
                        maxEmployee: 0,
                        price: 0,
                        name: '',
                        description: '',
                        humanResources: [],
                    })}
                >
                    + Thêm phòng mới
                </Button>
            </header>

            <div className={styles.search}>
                <input
                    type="text"
                    placeholder="Tìm kiếm tên phòng"
                />

                <span className={styles.buttonContainer}>
                    <Button
                        onClick={() => setDisplayMode(displayMode === 'table' ? 'grid' : 'table')}
                    >
                        {displayMode === 'table' && <i className="fa-solid fa-list" />}
                        {displayMode === 'grid' && <i className="fa-solid fa-border-all" />}
                        {' '}
                        Hiển thị
                    </Button>
                    <Button
                        onClick={handleSearchRooms}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                        {' '}
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={handleFetchRooms}
                    >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        {' '}
                        Làm mới
                    </Button>
                </span>
            </div>

            {displayMode === 'table' && (
                <Table>
                    <thead>
                        <tr>
                            <th>Stt</th>
                            <th>Tên phòng</th>
                            <th>Mô tả</th>
                            <th>Giá phòng</th>
                            <th>Nhân sự</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room, index) => (
                            <tr key={index}>
                                <td>{index}</td>
                                <td>{room.name}</td>
                                <td>{room.description}</td>
                                <td>{room.price}</td>
                                <td>
                                    <span className={room.employee < room.maxEmployee ?
                                        styles.green :
                                        styles.red}
                                    >
                                        {`${room.employee} / ${room.maxEmployee}`}
                                    </span>
                                </td>
                                <td >
                                    <div className={styles.buttonContainer}>
                                        <Button
                                            onClick={() => setSelectingRoom({...room})}
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </Button>
                                        <Button
                                            onClick={() => setDeletingRoom(room)}
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {displayMode === 'grid' && (
                <div className={styles.roomGrid}>
                    {rooms.map((room, index) => (
                        <button
                            key={index}
                            className={styles.room}
                            onClick={() => setSelectingRoom({...room})}
                        >
                            <div>{room.name}</div>
                            <div>{room.description}</div>
                            <div>{room.price}</div>
                            <div>
                                <span>
                                    {`${room.employee} / ${room.maxEmployee} `}
                                </span>
                                {room.employee < room.maxEmployee ? (
                                    <span className={styles.green}>Còn trống</span>
                                ) : (
                                    <span className={styles.red}>Đầy phòng</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.paginationWrapper}>
                <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total} />
            </div>

            {(newRoom || selectingRoom) && !deletingRoom && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>{newRoom ? 'Thêm phòng mới' : 'Sửa phòng'}</h2>

                        <input
                            type="text"
                            placeholder="Tên phòng"
                            value={newRoom?.name || selectingRoom?.name || ''}
                            onChange={(e) => newRoom ?
                                setNewRoom({...newRoom, name: e.target.value}) :
                                setSelectingRoom({...selectingRoom, name: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Mô tả phòng"
                            value={newRoom?.description || selectingRoom?.description || ''}
                            onChange={(e) => newRoom ?
                                setNewRoom({...newRoom, description: e.target.value}) :
                                setSelectingRoom({...selectingRoom, description: e.target.value})}
                        />
                        <input
                            type="number"
                            placeholder="Giá phòng"
                            value={newRoom?.price || selectingRoom?.price || ''}
                            onChange={(e) => newRoom ?
                                setNewRoom({...newRoom, price: e.target.value}) :
                                setSelectingRoom({...selectingRoom, price: e.target.value})}
                        />
                        <input
                            type="number"
                            placeholder="Nhân sự tối đa"
                            value={newRoom?.maxEmployee || selectingRoom?.maxEmployee || ''}
                            onChange={(e) => newRoom ?
                                setNewRoom({...newRoom, maxEmployee: e.target.value}) :
                                setSelectingRoom({...selectingRoom, maxEmployee: e.target.value})}
                        />

                        <div className={styles.services}>
                            {services.map((service, index) => (
                                <button
                                    key={index}
                                    className={
                                        newRoom?.services.includes(service) ||
                                        selectingRoom?.services.includes(service)
                                            ? styles.selected
                                            : ''
                                    }
                                    onClick={() => {
                                        newRoom ? (
                                            newRoom.service.includes(service)
                                                ? setNewRoom({
                                                    ...newRoom,
                                                    services: newRoom.services.filter((s) => s !== service)
                                                })
                                                : setNewRoom({
                                                    ...newRoom,
                                                    services: [...newRoom.services, service]
                                                })
                                        ) : (
                                            selectingRoom.services.includes(service)
                                                ? setSelectingRoom({
                                                    ...selectingRoom,
                                                    services: selectingRoom.services.filter((s) => s !== service)
                                                })
                                                : setSelectingRoom({
                                                    ...selectingRoom,
                                                    services: [...selectingRoom.services, service]
                                                })
                                        )
                                    }}
                                >
                                    {service}
                                </button>
                            ))}
                        </div>

                        {selectingRoom && (
                            <>
                                <div className={styles.employee}>
                                    Nhân sự:
                                    <Button
                                        onClick={() => setNewEmployee({})}
                                    >
                                        <i className="fa-solid fa-user-plus"></i>
                                    </Button>
                                </div>

                                <div className={styles.humanResources}>
                                    {selectingRoom.humanResources.map((hr, index) => (
                                        <span key={index}>
                                            {hr}
                                            <button
                                                onClick={() => handleRemoveUserFromRoom()}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className={styles.buttonContainer}>
                            <Button
                                onClick={newRoom ? handleAddRoom : handleUpdateRoom}
                            >
                                {newRoom ? 'Thêm' : 'Cập nhật'}
                            </Button>
                            {selectingRoom && (
                                <Button
                                    onClick={() => setDeletingRoom(selectingRoom)}
                                >
                                    Xóa
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    setNewRoom(null);
                                    setSelectingRoom(null);
                                    setDeletingRoom(null);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>


                    {newEmployee && (
                        <Overlay>
                            <div className={styles.modal}>
                                <h2>Thêm nhân sự</h2>

                                <div className={styles.search}>
                                    <input
                                        type="text"
                                        placeholder="Tên nhân sự"
                                        value={newEmployee.name ?? ""}
                                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                                    />
                                    <Button
                                        onClick={handleSearchUsers}
                                    >
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </Button>
                                </div>

                                <div className={styles.users}>
                                    {users.map((user, index) => (
                                        <Button
                                            key={index}
                                            onClick={() => handleAddUserToRoom(newRoom,user)}
                                        >
                                            {user.name}
                                        </Button>
                                    ))}
                                </div>

                                <Button
                                    onClick={() => setNewEmployee(null)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </Overlay>
                    )}
                </Overlay>
            )}

            {deletingRoom && (
                <Overlay>
                    <div className={styles.deleteModal}>
                        <h2>Xóa phòng {deletingRoom.name}?</h2>
                        <Button onClick={handleDeleteRoom}>Xóa</Button>
                        <Button onClick={() => setDeletingRoom(null)}>Hủy</Button>
                    </div>
                </Overlay>
            )}
        </div>
    )
}