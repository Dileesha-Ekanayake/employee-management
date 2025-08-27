import {useEffect, useState} from "react";
import {ApiService} from "../service/api-service.ts";
import {ApiEndpoints} from "../service/api-endpoints.ts";
import type {Employee} from "../entity/Employee.ts";
import type {Gender} from "../entity/Gender.ts";
import './EmployeeComponent.css';
import * as React from "react";

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

export function EmployeeComponent() {

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [oldEmployee, setOldEmployee] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [genders, setGenders] = useState<Gender[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState<FormState>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [updating, setUpdating] = useState(false);

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

        disableButtons(false, true);
    }, []);

    /**
     * Fetches the list of employees from the API and updates the employees state.
     * If the API call fails, sets an error message to the error state.
     *
     * @return {Promise<void>} A promise that resolves when the employee data is successfully loaded and state is updated.
     */
    async function loadEmployees(): Promise<void> {
        try {
            const response = await ApiService.get<Employee[]>(ApiEndpoints.paths.employee);
            return setEmployees(response.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch employees";
            setError(errorMessage);
        }
    }

    /**
     * Fetches the list of genders from the API and updates the state with the retrieved data.
     * Handles errors by setting an appropriate error message.
     *
     * @return {Promise<void>} A promise that resolves when the genders are successfully loaded or rejects if an error occurs.
     */
    async function loadGenders(): Promise<void> {
        try {
            const response = await ApiService.get<Gender[]>(ApiEndpoints.paths.gender);
            return setGenders(response.data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to fetch genders";
            setError(errorMessage);
        }
    }

    /**
     * Disables buttons based on the provided boolean parameters.
     *
     * @param {boolean} add - Determines whether the "add" button should be disabled.
     * @param {boolean} update - Determines whether the "update" button should be disabled.
     * @return {void} This function does not return a value.
     */
    function disableButtons(add: boolean, update: boolean): void {
        setSubmitting(add);
        setUpdating(update);
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
    const save = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const errors = getErrors();
        if (errors.length > 0) {
            setError(errors.join(", "));
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

    /**
     * Handles the update operation when the form is submitted.
     * This function processes the updates, validates for any errors,
     * submits the updated data to the API, and triggers a UI update.
     *
     * @param {React.FormEvent} e - The event triggered by the form submission.
     * @returns {Promise<void>} A promise that resolves when the update process completes.
     *
     * The function performs the following steps:
     * 1. Prevents the default form submission behavior.
     * 2. Retrieves the list of updates and, if changes are detected, displays them in an alert.
     * 3. Checks for validation errors and updates the error state if any exist.
     * 4. Executes the API call to update employee data when there are no errors.
     * 5. On success, refreshes the employee list, resets the form to its initial state,
     *    and displays a confirmation message with the response data.
     * 6. On failure, updates the error state with the encountered error message.
     * 7. Toggles the updating state and re-enables submit buttons after the process finishes.
     */
    const update = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        const updates = getUpdates();
        if (updates.length > 0) {
            alert(updates.join(", "));
        } else {
            alert("No changes detected");
        }

        const errors = getErrors();
        if (errors.length > 0) {
            setError(errors.join(", "));
            return;
        }

        setUpdating(true);
        setError(null);

        try {

            if (employee && oldEmployee) {
                employee.id = oldEmployee.id;
            }
            const response = await ApiService.put<Employee>(
                ApiEndpoints.paths.employee,
                employee
            );

            await loadEmployees();
            setForm(initialForm);
            alert(response.message + " " + response.data);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update employee";
            setError(errorMessage);
        } finally {
            setUpdating(false);
            disableButtons(false, true);
        }
    }

    /**
     * Deletes a specified employee after user confirmation.
     *
     * This function prompts the user with a confirmation dialog before proceeding with the deletion of the employee.
     * If confirmed, it sends a DELETE request to the server to remove the employee identified by the given ID.
     * Upon successful deletion, it refreshes the list of employees and displays a notification message.
     * In the case of an error during the deletion process, the error message is displayed.
     *
     * @param {Employee} employee - The employee object containing details of the employee to be deleted, including their ID and name.
     * @returns {Promise<void>} A promise that resolves once the employee is deleted and the employees' list is refreshed.
     */
    const deleteEmployee = async (employee: Employee): Promise<void> => {

        if (!window.confirm("Are you sure you want to delete this employee? : " + employee.name + "")) {
            return;
        }

        try {
            const response = await ApiService.delete<Employee>(
                ApiEndpoints.paths.employee + "/" + employee.id
            );
            await loadEmployees();
            alert(response.message + " " + response.data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete employee";
            setError(errorMessage);
        }
    };


    if (loading) return <div>Loading employees and genders...</div>;
    if (error) return <div>Error: {error}</div>;

    /**
     * Collects and returns a list of validation error messages based on missing form fields.
     *
     * @return {string[]} An array of error messages indicating which form fields are missing or invalid.
     */
    function getErrors(): Array<string> {
        const errors: string[] = [];

        if (!form.name) errors.push("Name is required");
        if (!form.nic) errors.push("NIC is required");
        if (!form.email) errors.push("Email is required");
        if (!form.gender) errors.push("Gender is required");

        return errors;
    }

    /**
     * Updates the form with the provided employee data and prepares the form
     * state for potential editing by initializing old and current employee data.
     *
     * @function
     * @param {Employee} employee - The employee object containing data to populate the form.
     * @returns {void}
     */
    const fillForm = (employee: Employee): void => {
        setForm(employee);
        setEmployee(JSON.parse(JSON.stringify(employee)));
        setOldEmployee(JSON.parse(JSON.stringify(employee)));

        disableButtons(true, false);
    }

    /**
     * Identifies and returns a list of updates made to an employee's information by comparing the current employee data to the old employee data.
     *
     * @return {Array<string>} An array of strings describing the specific updates that were made (e.g., "Name is updated", "NIC is updated", etc.).
     * If no updates are found, returns an empty array.
     */
    function getUpdates(): Array<string> {
        const updates: string[] = [];

        if (employee && oldEmployee) {
           if (employee.name !== oldEmployee.name) {
               updates.push("Name is updated");
           }
           if (employee.nic !== oldEmployee.nic) {
               updates.push("NIC is updated");
           }
           if (employee.email !== oldEmployee.email) {
               updates.push("Email is updated");
           }
           if (employee.gender?.id !== oldEmployee.gender?.id) {
               updates.push("Gender is updated");
           }
        }
        return updates;
    }

    /**
     * Resets the form state and associated variables to their initial values.
     *
     * This function performs the following actions:
     * - Resets the form data to its initial state.
     * - Clears the current employee data.
     * - Clears the old employee reference.
     * - Updates button states by disabling or enabling specific buttons.
     *
     * This is typically used to clear and reset the interface after an operation has been completed or when initializing the form.
     *
     * @function clear
     * @returns {void} Does not return any value.
     */
    const clear = (): void => {
        setForm(initialForm);
        setEmployee(null);
        setOldEmployee(null);
        disableButtons(false, true);
    }

    return (
        <div className="employee-container">
            <h2>Add New Employee</h2>

            <form className="employee-form"
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

                <div className="button-container">
                    <button
                        type="submit"
                        disabled={submitting}
                        onClick={save}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: submitting ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {submitting ? 'Adding...' : 'Add'}
                    </button>

                    <button
                        type="submit"
                        disabled={updating}
                        onClick={update}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: updating ? '#ccc' : '#fd3b3c',
                            color: 'white',
                            border: 'none',
                            cursor: updating ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {updating ? 'Updating...' : 'Update'}
                    </button>

                    <button
                        type="button"
                        onClick={clear}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6eab47',
                            color: 'white',
                            border: 'none',
                        }}
                    >
                        Clear
                    </button>
                </div>
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
                        <th>Action</th>
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
                            <td>
                                <div className="action-button-container">
                                    <button className="edit-button" onClick={() => fillForm(emp)}>Edit</button>
                                    <button className="delete-button" onClick={() => deleteEmployee(emp)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
