import * as React from 'react';
import axios from 'axios';

const API_ENDPOINT = 'https://api.helsedirektoratet.no/helserefusjon/v1/takstkoder';

function App() {
  
  const [validDate, setValidDate] = React.useState(new Date().toISOString().split("T")[0]);

  const [tariffs, setTariffs] = React.useState([]);

  const [subjectArea, setSubjectArea] = React.useState('PO');

  const [tariffCode, setTariffCode] = React.useState('');

  const handleInputChange = (event) => {
    setValidDate(event.target.value);
  }
 
  const handleTodayClick = () => {
    setValidDate(new Date().toISOString().split("T")[0]);
  };

  const handleGetTariffsClick = async () => {
    let result = '';
    if(subjectArea === "ALLE")
    {
       result = await axios.get(`${API_ENDPOINT}?gyldigdato=${validDate}&takstkode=${tariffCode}`);
    }
    else {
       result = await axios.get(`${API_ENDPOINT}?fagomraade=${subjectArea}&gyldigdato=${validDate}&takstkode=${tariffCode}`);
    }

    const sortedTariffs = result.data.takstkoder.sort((a, b) => {
      return a.takstkode.localeCompare(b.takstkode);  
    });

    setTariffs(sortedTariffs);
  };

  const handleSubjectAreaChange = (event) => {
    setSubjectArea(event.target.value);
  }

  const handleTariffCodeChange = (event) => {
    setTariffCode(event.target.value);
  }

  return (
    <>
     <h1>Takster hentet fra Helsedirektoratets API</h1>
     <h3>Dette nettstedet er utviklet av Asbjørn Engås. Dette er <em>IKKE</em> et offisielt nettsted for Helsedirektoratet, og det har ingen tilknytning til Helsedirektoratet.</h3>
     <p>
      <label htmlFor="subjectAreaSelect">Fagområde:    </label> 
      <select id="subjectAreaSelect" onChange={handleSubjectAreaChange}>
        <option value="ALLE">Alle</option>
        <option value="AP">Audiopedagog</option>
        <option value="BE">Behandlingsreiser i utlandet</option>
        <option value="FBV">Fritt behandlingsvalg</option>
        <option value="FY">Fysioterapi</option>
        <option value="HS">Helsestasjon</option>
        <option value="JO">Jordmor</option>
        <option value="KI">Kiropraktor</option>
        <option value="LE">Lege</option>
        <option value="LOGO">Logoped</option>
        <option value="LR">Private lab/radiologi</option>
        <option value="OR">Ortoptist</option>
        <option value="PO" selected>Poliklinikk</option>
        <option value="PS">Psykolog</option>
        <option value="PT">Primærhelseteam</option>
        <option value="RE">Rehabiliteringsinstitusjon</option>
        <option value="TH">Tannhelse</option>
        <option value="TP">Tannpleier</option>
      </select>
     </p>
     <p>
      <label htmlFor="validDateInput">Gyldig dato: </label>    
      <input id="validDateInput" value={validDate} onChange={handleInputChange}/>
      <button onClick={handleTodayClick}>Dagens dato</button>
      <label><em> Filtrerer takstene til kun de som er gyldig på en gitt dato. Dato på formatet yyyy-MM-dd:</em></label>
     </p>
     <p>
      <label htmlFor="tariffCodeInput">Takstkode: </label>
      <input id="tariffCodeInput" value={tariffCode} onChange={handleTariffCodeChange}></input>
      <label><em> Filtrer takstene til en gitt kode, kan kombineres med de andre parametrene eller brukes alene.</em></label>
     </p>
     <p>
      <button onClick={handleGetTariffsClick}>Hent takster</button>
     </p>
     <table border="1">
        <thead>
          <tr>
            <th>Takstkode</th>
            <th>Fagområde</th>
            <th>Fra dato</th>
            <th>Til dato</th>
            <th>Honorar</th>
            <th>Refusjon</th>
            <th>Pasient egenbetaling</th>
            <th>Repetisjonsprosent</th>
            <th>Ugyldig kombinasjon</th>
            <th>Tidsbruk per rep</th>
            <th>Beskrivelse</th>
          </tr>
        </thead>
        <tbody>
          {tariffs.map((item) => (
            <tr key={item.takst_id}>
              <td>{item.takstkode}</td>
              <td>{item.fagomraade}</td>
              <td>{item.fradato}</td>
              <td>{item.tildato}</td>
              <td>{item.honorar}</td>
              <td>{item.refusjon}</td>
              <td>{item.pasient_egenbetaling}</td>
              <td>{item.repetisjonsprosent}</td>
              <td>{item.ugyldig_kombinasjon}</td>
              <td>{item.tidsbruk_per_rep}</td>
              <td>{item.beskrivelse}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App;
