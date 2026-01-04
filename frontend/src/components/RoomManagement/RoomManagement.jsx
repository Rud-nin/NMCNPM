import { useEffect, useState } from "react";
import Button from "../Button/Button";
import Table from "../Table/Table";
import Pagination from "../Pagination/Pagination";
import Overlay from "../Overlay/Overlay";
import styles from "./RoomManagement.module.css";
import { useRoomStore } from "../../stores/useRoomStore";
import { useServiceStore } from "../../stores/useServiceStore";
import { useUsersStore } from "../../stores/useUsersStore";

function RoomRequests() {
    const { getRoomRequests, approveRoomRequest, rejectRoomRequest } = useRoomStore();
    const [requests, setRequests] = useState([]);
    const [aprprovingRequests, setAprrovingRequests] = useState(null);
    const [rejectingRequests, setRejectingRequests] = useState(null);

    const [filterBy, setFilterBy] = useState("");
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);

    const states = {
        "Pending": {
            translated: "Chờ xử lý",
            className: styles.yellow,
        },
        "Approved": {
            translated: "Đã duyệt",
            className: styles.green,
        },
        "Rejected": {
            translated: "Từ chối",
            className: styles.red,
        }
    }

    const handleFetchRoomRequests = async () => {
        const res = await getRoomRequests(page, limit, filterBy);
        if (res) {
            setRequests(res.data);
            setTotal(res.pagination.totalPages);
        }
    }

    const handleApproveRoomRequest = async (requestId) => {
        const res = await approveRoomRequest(requestId);
        if (res) {
            setRequests(prev => prev.map(
                (r) => r.RequestID === requestId ? {...r, Status: "Approved"} : r
            ));
        }
        setAprrovingRequests(null);
    }

    const handleRejectRoomRequest = async (requestId) => {
        const res = await rejectRoomRequest(requestId);
        if (res) {
            setRequests(prev => prev.map(
                (r) => r.RequestID === requestId ? {...r, Status: "Rejected"} : r
            ))
        }
        setRejectingRequests(null);
    }

    useEffect(() => {
        handleFetchRoomRequests();
    }, [limit, page, filterBy]);

    return (
        <div className={styles.roomManagement}>
            <header>
                <h2>Yêu cầu phòng</h2>
                <div className={styles.buttonContainer}>
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                    >
                        <option value="">Tất cả</option>
                        {Object.entries(states).map(([key, value]) => (
                            <option key={key} value={key}>{value.translated}</option>
                        ))}
                    </select>
                    <Button
                        onClick={handleFetchRoomRequests}
                    >
                        <i className="fa-solid fa-arrows-rotate"></i>
                        {' '}
                        Làm mới
                    </Button>
                </div>
            </header>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Phòng</th>
                        <th>Người dùng</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request.RequestID}>
                            <td>{request.RequestID}</td>
                            <td>{`${request.Building}-${request.RoomNumber}`}</td>
                            <td>{request.FullName}</td>
                            <td>
                                <span className={states[request.Status ?? "Pending"].className}>
                                    {states[request.Status].translated}
                                </span>
                            </td>
                            <td>
                                {request.Status === "Pending" && (
                                    <div className={styles.buttonContainer}>
                                        <Button
                                            onClick={() => setAprrovingRequests(request)}
                                        >
                                            <i className="fa-solid fa-check"></i>
                                        </Button>
                                        <Button
                                            onClick={() => setRejectingRequests(request)}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {(!requests || requests.length === 0) && (
                <div className={styles.noResult}>Không có kết quả</div>
            )}

            <div className={styles.paginationContainer}>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    page={page}
                    setPage={setPage}
                    total={total}
                />
            </div>

            {aprprovingRequests && (
                <Overlay>
                    <div className={styles.requestModal}>
                        <h2>Xác nhận yêu cầu của {aprprovingRequests.FullName}?</h2>
                        <Button
                            onClick={() => handleApproveRoomRequest(aprprovingRequests.RequestID)}
                        >
                            Xác nhận
                        </Button>
                        <Button
                            onClick={() => setAprrovingRequests(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}

            {rejectingRequests && (
                <Overlay>
                    <div className={styles.requestModal}>
                        <h2>Từ chối yêu cầu của {rejectingRequests.FullName}?</h2>
                        <Button
                            onClick={() => handleRejectRoomRequest(rejectingRequests.RequestID)}
                        >
                            Từ chối
                        </Button>
                        <Button
                            onClick={() => setRejectingRequests(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}
        </div>
    )
}

function RoomDetail({ roomId, cancel, remove }) {
    const { getRoomById, addUserToRoom, removeUserFromRoom } = useRoomStore();
    const { services, getServices } = useServiceStore();
    const { getUserByName } = useUsersStore();

    const [room, setRoom] = useState(null);
    const [roomUsers, setRoomUsers] = useState(null);
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState("");

    const handleFindUserByName = async () => {
        if (!username) return;
        const users = await getUserByName(username);
        if (users) {
            // Loại bỏ các user đã ở trong phòng
            setUsers(
                users.data.filter(
                    (u) => !roomUsers.find((ru) => ru.UserID === u.UserID)
                )
            );
        }
    }

    const handleAddUserToRoom = async (user) => {
        if (!room) return;
        const res = await addUserToRoom(room.RoomID, user.UserID);
        if (!res) return;
        setRoomUsers([...roomUsers, user]);
        setUsers(prev => prev.filter(u => u.UserID !== user.UserID));
    }

    const handleRemoveUserFromRoom = async (user) => {
        if (!room) return;
        const res = await removeUserFromRoom(user.UserID);
        if (!res) return;
        setRoomUsers(roomUsers.filter((u) => u.UserID !== user.UserID));
    }

    useEffect(() => {
        (async () => {
            let servicesRes;
            if (!services || services.length === 0) servicesRes = getServices();
            const [data] = await Promise.all([
                getRoomById(roomId),
                servicesRes,
            ]);
            setRoom(data?.room);
            setRoomUsers(data?.users);
        })();
    }, []);

    return (
        <Overlay>
            <div className={styles.modal}>
                <h2>Chi tiết phòng</h2>
                <div>Tòa: {room?.Building}</div>
                <div>Số phòng: {room?.RoomNumber}</div>
                <div>Nhân sự hiện tại: {room?.Occupancy}</div>
                <div>Nhân sự tối đa: {room?.Capacity}</div>
                <div className={styles.employee}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}/>
                    <Button
                        onClick={handleFindUserByName}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </Button>
                </div>
                {users && users.length > 0 && (
                    <>
                    Chọn người dùng để thêm vào phòng:
                    <div className={styles.users}>
                        {users.map((user) => (
                            <Button
                                key={user.UserID}
                                onClick={() => handleAddUserToRoom(user)}
                            >
                                {user.FullName}
                            </Button>
                        ))}
                    </div>
                    </>
                )}
                <div className={styles.humanResources}>
                    Nhân sự:
                    {roomUsers?.map((user) => (
                        <span
                            key={user.UserID}
                            className={styles.humanResources}
                        >
                            {user.FullName}
                            <button
                                onClick={() => handleRemoveUserFromRoom(user)}
                            >
                                <i className="fa-solid fa-x"></i>
                            </button>
                        </span>
                    ))}
                </div>
                <div className={styles.buttonContainer}>
                    <Button onClick={remove}>
                        Xóa
                    </Button>
                    <Button onClick={cancel}>
                        Hủy
                    </Button>
                </div>
            </div>
        </Overlay>
    )
}

function Rooms() {
    const [displayMode, setDisplayMode] = useState("table"); // table | grid

    const { rooms, getRooms, createRoom, deleteRoom } = useRoomStore();

    const [newRoom, setNewRoom] = useState(null);
    const [selectingRoom, setSelectingRoom] = useState(null);
    const [deletingRoom, setDeletingRoom] = useState(null);

    const handleFetchRooms = getRooms;

    const handleSearchRooms = () => {
        console.log("TODO: handle search rooms");
    }

    const handleAddRoom = async () => {
        if (newRoom) {
            await createRoom(newRoom);
            setNewRoom(null);
        }
    }

    const handleDeleteRoom = async () => {
        if (deletingRoom) {
            await deleteRoom(deletingRoom.RoomID);
            setDeletingRoom(null);
            setSelectingRoom(null);
        }
    }

    useEffect(() => {
        handleFetchRooms();
    }, []);

    return (
        <div className={styles.roomManagement}>
            <header>
                <h2>Quản lý phòng</h2>
                <Button
                    onClick={() => setNewRoom({})}
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
                            <th>ID</th>
                            <th>Mã phòng</th>
                            <th>Nhân sự</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((room) => (
                            <tr key={room.RoomID}>
                                <td>{room.RoomID}</td>
                                <td>{`${room.Building}-${room.RoomNumber}`}</td>
                                <td>
                                    <span className={(room.Occupancy ?? 0) < room.Capacity ?
                                        styles.green :
                                        styles.red}
                                    >
                                        {`${room.Occupancy ?? 0} / ${room.Capacity}`}
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
                    {rooms.map((room) => (
                        <button
                            key={room.RoomID}
                            className={styles.room}
                            onClick={() => setSelectingRoom({...room})}
                        >
                            <div>{`${room.Building}-${room.RoomNumber}`}</div>
                            <div>
                                <span>
                                    {`${room.Occupancy} / ${room.Capacity} `}
                                </span>
                                {room.Occupancy < room.Capacity ? (
                                    <span className={styles.green}>Còn trống</span>
                                ) : (
                                    <span className={styles.red}>Đầy phòng</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {(!rooms || rooms.length === 0) && (
                <div className={styles.noResult}>Không có kết quả</div>
            )}

            {newRoom && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>Thêm phòng mới</h2>

                        <input
                            type="text"
                            placeholder="Tòa nhà"
                            value={newRoom.Building ?? ''}
                            onChange={(e) => setNewRoom({...newRoom, Building: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Số phòng"
                            value={newRoom.RoomNumber ?? ''}
                            onChange={(e) => setNewRoom({...newRoom, RoomNumber: e.target.value})}
                        />
                        <input
                            type="number"
                            placeholder="Nhân sự tối đa"
                            min={1}
                            value={newRoom.Capacity ?? ''}
                            onChange={(e) => setNewRoom({...newRoom, Capacity: e.target.value})}
                        />

                        <div className={styles.buttonContainer}>
                            <Button
                                onClick={handleAddRoom}
                            >
                                Thêm
                            </Button>
                            <Button
                                onClick={() => {
                                    setNewRoom(null);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </Overlay>
            )}

            {selectingRoom && (
                <RoomDetail
                    roomId={selectingRoom.RoomID}
                    cancel={() => setSelectingRoom(null)}
                    remove={() => setDeletingRoom({...selectingRoom})}
                />
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

export default function RoomManagement() {
    return (
        <div className={styles.container}>
            <RoomRequests />
            <Rooms />
        </div>
    )
}