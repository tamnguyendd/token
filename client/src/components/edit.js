import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";

export default function Edit() {
    const [form, setForm] = useState({
        person_name: "",
        person_position: "",
        person_level: "",
        records: [],
    });
    const params = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const id = params.id.toString();
            const response = await fetch(`${process.env.REACT_APP_API_URL}record/${params.id.toString()}`);

            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }

            const record = await response.json();
            if (!record) {
                window.alert(`Record with id ${id} not found`);
                navigate("/");
                return;
            }

            setForm(record);
        }

        fetchData();

        return;
    }, [params.id, navigate]);

    // These methods will update the state properties.
    function updateForm(value) {
        return setForm((prev) => {
            return { ...prev, ...value };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        const editedPerson = {
            person_name: form.person_name,
            person_position: form.person_position,
            person_level: form.person_level,
        };
        
        console.log(editedPerson);

        // This will send a post request to update the data in the database.
        await fetch(`${process.env.REACT_APP_API_URL}update/${params.id}`, {
            method: "POST",
            body: JSON.stringify(editedPerson),
            headers: {
                'Content-Type': 'application/json'
            },
        });

        navigate("/");
    }

    // This following section will display the form that takes input from the user to update the data.
    return (
        <div>
            <h3>Update Record</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Name: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={form.person_name}
                        onChange={(e) => updateForm({ person_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="position">Position: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="position"
                        value={form.person_position}
                        onChange={(e) => updateForm({ person_position: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionIntern"
                            value="Intern"
                            checked={form.person_level === "Intern"}
                            onChange={(e) => updateForm({ person_level: e.target.value })}
                        />
                        <label htmlFor="positionIntern" className="form-check-label">Intern</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionJunior"
                            value="Junior"
                            checked={form.person_level === "Junior"}
                            onChange={(e) => updateForm({ person_level: e.target.value })}
                        />
                        <label htmlFor="positionJunior" className="form-check-label">Junior</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="positionOptions"
                            id="positionSenior"
                            value="Senior"
                            checked={form.person_level === "Senior"}
                            onChange={(e) => updateForm({ person_level: e.target.value })}
                        />
                        <label htmlFor="positionSenior" className="form-check-label">Senior</label>
                    </div>
                </div>
                <br />

                <div className="form-group">
                    <input
                        type="submit"
                        value="Update Record"
                        className="btn btn-primary"
                    />
                </div>
            </form>
        </div>
    );
}