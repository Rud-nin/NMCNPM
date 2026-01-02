import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useServiceStore } from "../../stores/useServiceStore";
import Button from "../Button/Button";
import Table from "../Table/Table";
import Overlay from "../Overlay/Overlay";
import Pagination from "../Pagination/Pagination";
import styles from "./ServiceManagement.module.css";

export default function ServiceManagement() {

    const {
        services,
        getServices,
        createService,
        updateService,
        deleteService
    } = useServiceStore();
    const [newService, setNewService] = useState(null);
    const [selectingService, setSelectingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);

    const [search, setSearch] = useState("");

    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(1);

    const handleFetchServices = async () => {
        const res = await getServices(limit, page);
        if (res) {
            const { pagination: { limit, page, totalPages } } = res;
            setLimit(limit);
            setPage(page);
            setTotal(totalPages);
        }
    }

    const handleSearchServices = () => {
        console.log("TODO: search services");
    }

    const handleAddService = async () => {
        if (newService) {
            if (!newService.ServiceName ||
                !newService.Descriptions ||
                !newService.Price ||
                !newService.type) {
                return toast.error("Vui lòng điền đầy đủ thông tin");
            }
            await createService(newService);
            setNewService(null);
        }
    }

    const handleUpdateService = async () => {
        if (selectingService) {
            if (!selectingService.ServiceName ||
                !selectingService.Descriptions ||
                !selectingService.Price ||
                !selectingService.type) {
                return toast.error("Vui lòng điền đầy đủ thông tin");
            }
            await updateService(selectingService.ServiceID, selectingService);
            setSelectingService(null);
        }
    }

    const handleDeleteService = async () => {
        if (deletingService) {
            await deleteService(deletingService.ServiceID);
            setSelectingService(null);
            setDeletingService(null);
        }
    }

    useEffect(() => {
        handleFetchServices();
    }, [limit, page]);

    return (
        <div className={styles.serviceManagement}>
            <header>
                <h2>Quản lý dịch vụ</h2>
                <Button
                    onClick={() => setNewService({ type: "Dịch vụ chung" })}
                >
                    + Thêm dịch vụ mới
                </Button>
            </header>

            <div className={styles.search}>
                <input
                    type="text"
                    placeholder="Tìm kiếm tên dịch vụ"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={handleSearchServices}
                    >
                        <i className="fa-solid fa-magnifying-glass"></i>{' '}
                        Tìm kiếm
                    </Button>
                    <Button
                        onClick={handleFetchServices}
                    >
                        <i className="fa-solid fa-arrows-rotate"></i>{' '}
                        Làm mới
                    </Button>
                </div>
            </div>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Dịch vụ</th>
                        <th>Mô tả</th>
                        <th>Loại dịch vụ</th>
                        <th>Thành tiền</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{service.ServiceName}</td>
                            <td>{service.Descriptions}</td>
                            <td>{service.type}</td>
                            <td>{service.Price.toLocaleString()}</td>
                            <td>
                                <div className={styles.buttonContainer}>
                                    <Button
                                        onClick={() => setSelectingService({...service})}
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                    </Button>
                                    <Button
                                        onClick={() => setDeletingService(service)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className={styles.pagination}>
                <Pagination
                    limit={limit}
                    setLimit={setLimit}
                    page={page}
                    setPage={setPage}
                    total={total} />
            </div>

            {(newService || selectingService) && !deletingService && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>{newService ? 'Thêm dịch vụ mới' : 'Sửa dịch vụ'}</h2>

                        <input
                            type="text"
                            placeholder="Tên dịch vụ"
                            value={newService?.ServiceName || selectingService?.ServiceName || ''}
                            onChange={(e) => newService ?
                                setNewService({...newService, ServiceName: e.target.value}) :
                                setSelectingService({...selectingService, ServiceName: e.target.value})}/>
                        <input
                            type="text"
                            placeholder="Mô tả dịch vụ"
                            value={newService?.Descriptions || selectingService?.Descriptions || ''}
                            onChange={(e) => newService ?
                                setNewService({...newService, Descriptions: e.target.value}) :
                                setSelectingService({...selectingService, Descriptions: e.target.value})}/>
                        
                        <select 
                            value={newService?.type || selectingService?.type || ''}
                            onChange={(e) => newService ?
                                setNewService({...newService, type: e.target.value}) :
                                setSelectingService({...selectingService, type: e.target.value})}
                        >
                            <option value="Dịch vụ chung">Dịch vụ chung</option>
                            <option value="Dịch vụ cá nhân">Dịch vụ cá nhân</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Giá dịch vụ"
                            value={newService?.Price || selectingService?.Price || ''}
                            onChange={(e) => newService ?
                                setNewService({...newService, Price: e.target.value}) :
                                setSelectingService({...selectingService, Price: e.target.value})}/>

                        <div className={styles.buttonContainer}>
                            <Button
                                onClick={newService ? handleAddService : handleUpdateService}
                            >
                                {newService ? 'Thêm' : 'Cập nhật'}
                            </Button>
                            {selectingService && (
                                <Button
                                    onClick={() => setDeletingService(selectingService)}
                                >
                                    Xóa
                                </Button>
                            )}
                            <Button
                                onClick={() => {
                                    setNewService(null);
                                    setSelectingService(null);
                                    setDeletingService(null);
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                </Overlay>
            )}

            {deletingService && (
                <Overlay>
                    <div className={styles.deleteModal}>
                        <h2>Xóa dịch vụ {deletingService.name}?</h2>
                        <Button
                            onClick={handleDeleteService}
                        >
                            Xóa
                        </Button>
                        <Button
                            onClick={() => setDeletingService(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}
        </div>
    )
}