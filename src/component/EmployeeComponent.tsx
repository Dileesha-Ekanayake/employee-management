import { useEffect, useState } from "react";
import { ApiService } from "../service/api-service.ts";
import { ApiEndpoints } from "../service/api-endpoints.ts";
import type { Employee } from "../entity/Employee.ts";
import type { ApiResponse } from "../service/api-response.ts";

type Gender = {
    id: number;
    name: string;
};

type FormState = {
    name: string;
    nic: string;
    email: string;
    gender: Gender | null;
};

const initialForm: FormState = {
    name: "",
    nic: "",
    email: "",
    gender: null,
};

function EmployeeComponent() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [genders, setGenders] = useState<Gender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Fetch both employees and genders
        Promise.all([
            ApiService.get<ApiResponse<Employee>[]>(ApiEndpoints.paths.employee),
            ApiService.get<ApiResponse<Gender>[]>(ApiEndpoints.paths.gender) // Assuming you have this endpoint
        ])
            .then(([employeesResponse, gendersResponse]) => {
                setEmployees(employeesResponse.data);
                setGenders(gendersResponse.data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'genderId' ? (value ? Number(value) : "") : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.nic || !form.email || !form.gender?.id) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // If you update ApiService as suggested above:
            // const response = await ApiService.post<FormState, ApiResponse<Employee>>(
            //     ApiEndpoints.paths.employee,
            //     form
            // );
            // setEmployees(prev => [...prev, response.data]);

            // For now, with current ApiService:
            const response = await ApiService.post<FormState>(
                ApiEndpoints.paths.employee,
                form
            );

            // Refetch the employee list to get the updated data
            const updatedEmployees = await ApiService.get<ApiResponse<Employee>[]>(
                ApiEndpoints.paths.employee
            );
            setEmployees(updatedEmployees.data);

            // Reset form
            setForm(initialForm);

            console.log("Employee added successfully!");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add employee";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error && loading) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Add New Employee</h2>

            {/* Add Employee Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                            style={{ marginLeft: '10px', padding: '5px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        NIC:
                        <input
                            type="text"
                            name="nic"
                            value={form.nic}
                            onChange={handleInputChange}
                            required
                            style={{ marginLeft: '10px', padding: '5px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            required
                            style={{ marginLeft: '10px', padding: '5px' }}
                        />
                    </label>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>
                        Gender:
                        <select
                            name="gender"
                            value={form.gender?.id || ""}
                            onChange={handleInputChange}
                            required
                            style={{ marginLeft: '10px', padding: '5px' }}
                        >
                            <option value="">Select Gender</option>
                            {genders.map((gender) => (
                                <option key={gender.id} value={gender.id}>
                                    {gender.name}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {error && !loading && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: submitting ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer'
                    }}
                >
                    {submitting ? 'Adding...' : 'Add Employee'}
                </button>
            </form>

            <h2>Employee List</h2>

            <table border={1} cellPadding={8}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>NIC</th>
                    <th>Email</th>
                    <th>Gender</th>
                </tr>
                </thead>
                <tbody>
                {employees.map((emp) => (
                    <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>{emp.name}</td>
                        <td>{emp.nic}</td>
                        <td>{emp.email}</td>
                        <td>{emp.gender?.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeComponent;
