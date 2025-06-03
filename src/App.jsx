import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [randomList, setRandomList] = useState([]);
  const [socket, setSocket] = useState();
  useEffect(() => {
    const socket = new WebSocket("wss://localhost:44340/ws");
    socket.addEventListener("open", () => {
      console.log("WebSocket connected");
      socket.send(
        JSON.stringify({
          command: "get",
        })
      );
    });

    socket.addEventListener("message", (event) => {
      try {
        console.log("event", event);
      } catch (err) {
        console.error("Invalid JSON", err);
      }
    });

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      setRandomList(data.codes);
    };

    // 4. Listen for errors
    socket.addEventListener("error", (err) => {
      console.error("WebSocket error", err);
    });

    setSocket(socket);

    // 5. Cleanup on unmount
    return () => {
      socket.close();
    };
  }, []);

  const generateRandomList = () => {
    socket.send(
      JSON.stringify({
        command: "generate",
        length: 8,
        count: 1,
      })
    );
    socket.send(
      JSON.stringify({
        command: "get",
      })
    );
  };

  const codeUsed = (val, code) => {
    socket.send(
      JSON.stringify({
        command: val ? "disable" : "use",
        code: code,
      })
    );
    socket.send(
      JSON.stringify({
        command: "get",
      })
    );
  };

  return (
    <>
      <div className="random-list-container">
        <button className="generate-button" onClick={generateRandomList}>
          Generate Coupen Code
        </button>

        <div className="list-box">
          {randomList?.length > 0 ? (
            <>
              <ol className="random-list">
                {randomList.map((item, index) => (
                  <>
                    <li key={index}>
                      {item.Code}{" "}
                      <input
                        type="checkbox"
                        checked={item.IsUsed}
                        onChange={() => codeUsed(item.IsUsed, item.Code)}
                      />
                    </li>
                  </>
                ))}
              </ol>
            </>
          ) : (
            <p className="empty-message">
              Click the button to generate a random list!
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
