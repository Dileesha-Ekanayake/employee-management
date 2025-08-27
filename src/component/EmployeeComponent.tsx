import {useEffect, useState} from "react";
import {ApiService} from "../service/api-service.ts";
import {ApiEndpoints} from "../service/api-endpoints.ts";
import type {Employee} from "../entity/Employee.ts";
import type {Gender} from "../entity/Gender.ts";
import './EmployeeComponent.css';

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

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [genders, setGenders] = useState<Gender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(initialForm);
    const [submitting, setSubmitting] = useState(false);

    /*
     * useEffect lets you run a function after the component renders. Typical use cases include:
     * Fetching data from an API
     * Subscribing to events (e.g., websockets, DOM events)
     * Updating document title, localStorage, etc.
     * Cleaning up resources when the component unmounts
     *
     * The first argument is a function (the effect).
     * The second argument is an array of dependencies ([], [stateVar], etc.). It controls when the effect runs.
     *
     * useEffect with [] as dependencies run once after the first render, same as OnInit.
     *
     * Looks like similar to the Angular OnInit.
     *
     * useEffect is React’s way of handling side effects like data fetching.
     * With [] as dependencies, it is very similar to Angular’s OnInit.
    */
    useEffect(() => {
        Promise.all([loadEmployees(), loadGenders()])
            .finally(() => setLoading(false));
    }, []);

    async function loadEmployees() {
        try {
            const response = await ApiService.get<Employee[]>(ApiEndpoints.paths.employee);
            return setEmployees(response.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch employees";
            setError(errorMessage);
        }
    }

    async function loadGenders() {
        try {
            const response = await ApiService.get<Gender[]>(ApiEndpoints.paths.gender);
            return setGenders(response.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch genders";
            setError(errorMessage);
        }
    }

    /**
     * Handles input changes for a form field and updates the form state accordingly.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - The input change event containing the updated field value and name.
     * @returns {void}
     *
     * This function updates the form state based on the input name and value. If the input name corresponds to "gender",
     * it finds the matching gender object from the available list of genders using the value. The rest of the fields
     * are directly updated using their names and values. It ensures that when all required fields (name, nic, email, and gender)
     * are filled, a new employee object is created and set. If any of the required fields are incomplete, the employee state is reset to null.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
        const {name, value} = e.target;

        setForm(previous => {
            let employeeForm: FormState;

            if (name === "gender") {
                const selectedGender = genders.find(g => g.id.toString() === value) || null;
                employeeForm = {...previous, gender: selectedGender};
            } else {
                employeeForm = {...previous, [name]: value};
            }

            // Update the employee object if all fields are filled
            if (employeeForm.name && employeeForm.nic && employeeForm.email && employeeForm.gender) {
                const newEmployee: Employee = {
                    name: employeeForm.name,
                    nic: employeeForm.nic,
                    email: employeeForm.email,
                    gender: employeeForm.gender
                };
                setEmployee(newEmployee);
            } else {
                setEmployee(null); // incomplete form
            }

            return employeeForm;
        });
    };

    /**
     * Handles the submit event for a form, validating input fields and managing the form's state.
     *
     * This function performs the following tasks:
     * - Prevents the default form submission behavior.
     * - Checks if all required fields (`name`, `nic`, `email`, `gender`) are filled.
     * - Displays an error message if validation fails.
     * - Sets a submitting indicator and resets the error state before sending a request.
     * - Sends an asynchronous POST request to add an employee using `ApiService`.
     * - Reloads the employee list and resets the form state upon successful submission.
     * - Handles errors gracefully by displaying an appropriate error message.
     * - Toggles the submitting state back to `false` when the operation is complete.
     *
     * @param {React.FormEvent} e - The form submission event.
     * @returns {Promise<void>} A promise that resolves when the operation completes.
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!form.name || !form.nic || !form.email || !form.gender) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {

            const response = await ApiService.post<Employee>(
                ApiEndpoints.paths.employee,
                employee
            );

            await loadEmployees();
            setForm(initialForm);
            alert(response.message + " " + response.data);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to add employee";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading employees and genders...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="employee-container">
            <h2>Add New Employee</h2>

            <form className="employee-form" onSubmit={handleSubmit}
                  style={{marginBottom: '20px', padding: '20px', border: '1px solid #ccc'}}>
                <div className="form-group">
                    <div style={{marginBottom: '10px'}}>
                        <label>
                            Name:
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                required
                                style={{marginLeft: '10px', padding: '5px'}}
                            />
                        </label>
                    </div>

                    <div style={{marginBottom: '10px'}}>
                        <label>
                            NIC:
                            <input
                                type="text"
                                name="nic"
                                value={form.nic}
                                onChange={handleInputChange}
                                required
                                style={{marginLeft: '10px', padding: '5px'}}
                            />
                        </label>
                    </div>

                    <div style={{marginBottom: '10px'}}>
                        <label>
                            Email:
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleInputChange}
                                required
                                style={{marginLeft: '10px', padding: '5px'}}
                            />
                        </label>
                    </div>

                    <div style={{marginBottom: '10px'}}>
                        <label>
                            Gender:
                            <select
                                name="gender"
                                value={form.gender?.id?.toString() || ""}
                                onChange={handleInputChange}
                                required
                                style={{marginLeft: '10px', padding: '5px'}}
                            >
                                <option value="">Select Gender</option>
                                {genders.map((gender) => (
                                    <option key={gender.id} value={gender.id.toString()}>
                                        {gender.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {error && !loading && (
                    <div style={{color: 'red', marginBottom: '10px'}}>
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

            <div className="table-wrapper">
                <table className="employee-table" border={1} cellPadding={8}>
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
        </div>
    );
}

export default EmployeeComponent;
