
import React, { useState } from "react";

//Necessary CSS imports for the react-date-range package
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

//https://www.npmjs.com/package/react-date-range
import { DateRangePicker  } from 'react-date-range';

const API_URL = process.env.REACT_APP_API_URL
const ENDPOINT = "/events.csv"

function Form(props) {

    //Options for the date dropdown, custom handler method generates the proper output for each option
    //"Custom" will open the date range picker
    const dateOptions = ["All", new Date().getFullYear(), new Date().getFullYear() - 1, "Custom"];

    //Expected input to the date range picker component
    //Sets a "forever" date range when start and end is null
    const allRange = {
        startDate: null,
        endDate: null,
        key: 'selection',
    };

    //State values for controlled inputs
    const [chain, setChain] = useState('all');
    const [addresses, setAddresses] = useState('')
    const [range, setRange] = useState(allRange);
    const [format, setFormat] = useState('accointing');

    const [error, setError] = useState("");

    //Class name for hiding and showing the date range picker
    const [dateRangeClass, setDateRangeClass] = useState("hidden");

    //We handle submission in a custom way
    const onSubmit = (evt) => {
        evt.preventDefault();
    }

    //Custom submit hanlder
    //TODO: Fetch POST request to a backend API
    const submit = (evt) => {

        //The call to ISO string converts to UTC (which means we dont need to handle timezones on the backend)
        let startDate = range.startDate;
        let endDate = range.endDate;
        let data = {
            chain: chain,
            addresses: addresses,
            startDate: startDate ? startDate.toISOString(): null,
            endDate: endDate ? endDate.toISOString(): null,
            format: format
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        fetch(API_URL + ENDPOINT, requestOptions)
            .then((res) => {
                if (res.status === 500){
                    //Generic error handler for internal error
                    let errMsg = "There was an error processing your request, please try again later"
                    throw errMsg
                }else if(res.status !== 200){
                    return res.json();
                }
                else{
                    return res.blob()
                }
            })
            .then((data) => {
                if (data.message){
                    throw data.message;
                }
                setError("")
                //This is a hack to get around fetch limitations
                //You cannot download a file through AJAX requests normally
                //Create a link, attach CSV file to it and force click
                //See here: https://medium.com/yellowcode/download-api-files-with-react-fetch-393e4dae0d9e
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `events.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch(data => {
                if (typeof data == "string"){
                    setError(data)
                }else{
                    setError("There was an error processing your request, please try again later")
                }
            });

    }

    function handleDateRange(date){
        setRange(date["selection"]);
    }

    function handleDateSelect(value){
        if (value === "All"){
            //Hide date range picker and set range to "All" (i.e. null for start and end)
            setDateRangeClass("hidden");
            setRange(allRange);
        }else if (value === "Custom"){
            //This resets the Date range picker to "All" dates and shows the date range picker form
            setRange(allRange);
            setDateRangeClass("");
        }else{
            //Hide date range picker and set range to current year from option
            setDateRangeClass("hidden");
            //Start is January 1st at the beginning of the day, end is December 31st at the end of the day
            let start = new Date(value, 0, 1);
            let end = new Date(value, 11, 31);
            end.setHours(23, 59, 59, 999);
            setRange({
                        startDate: start,
                        endDate: end,
                        key: "selection"
            });
        }
    }

    return (
        <React.Fragment>
            <form className="Form" onSubmit={onSubmit}>
                <p className="form-header">Select a chain and enter your addresses to generate a CSV</p>
                <br/>
                <label className="input-label">Chain:</label>
                <select name="chains" className="input select" id="chains-input" defaultValue={chain} onChange={evt => setChain(evt.target.value)}>
                    <option value="osmosis-1">osmosis-1</option>
                    <option value="cosmoshub-4">cosmoshub-4</option>
                </select>
                <label className="input-label">Addresses:</label>
                <input 
                    name="addresses"
                    type="text"
                    id="address-input"
                    placeholder="Enter your addresses as a comma separated list"
                    className="input"
                    value={addresses}
                    onChange={evt => setAddresses(evt.target.value)}
                />
                <label className="input-label">Format:</label>
                <select name="format" className="input select" id="format-input" defaultValue={format} onChange={evt => setFormat(evt.target.value)}>
                    <option value="accointing">Accointing</option>
                    <option value="koinly">Koinly</option>
                </select>
                <label className="input-label">Date Range:</label>
                <select className="input select" id="date-input" defaultValue={dateOptions[0]} onChange={evt => handleDateSelect(evt.target.value)}>
                    {dateOptions.map((dateOption) => {
                        return (
                            <option value={dateOption} key={dateOption}>{dateOption}</option>
                        );
                    })}
                </select>
                <DateRangePicker
                    id="date-range-input"
                    className={dateRangeClass}
                    // The date range picker expects an array of ranges (for selecting multiple ranges)
                    //We only use one range so there is only 1 selection ever
                    ranges={[range]}
                    onChange={handleDateRange}
                />
                {error !== "" ? <p className="error">{error}</p>: null}
                <button className="submitButton" onClick={submit}>Generate</button>
            </form>
        </React.Fragment>
    );
}

export default Form;
