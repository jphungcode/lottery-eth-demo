import Head from 'next/head'
import {useEffect, useState, useRef} from 'react'
import Web3 from "web3";
import Web3Modal from "web3modal";



import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import Lottery from "../contracts/Lottery.json";

export default function Home() {

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState([]);
  const [lottery, setLottery] = useState(null);
  const [manager, setManager] = useState("");
  const [balance, setBalance] = useState("0");
  const [players, setPlayers] = useState([]);
  const [web3Loaded, setWeb3Loaded] = useState(false);
  const [etherToEnter, setEtherToEnter] = useState('0.01');
  const [winner, setWinner] = useState(null);
  const [enterLoadState, setEnterLoadState] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState(null);

  const [transactionMsg, setTransactionMsg] = useState(null);


  useEffect(()=>{
      loadWeb3()
      
      listenMMAccount();
  },[])

  
  async function listenMMAccount() {
    if(window.ethereum){
      window.ethereum.on("accountsChanged", async function(accounts) {
        console.log(accounts)
        setAccount(accounts[0])
      });

      window.ethereum.on('chainChanged', () => {
        document.location.reload()
      })
    }
   
  }

  async function loadWeb3() {
    try {
      // Get network provider and web3 instance.
      // const web3 = await getWeb3();
      const providerOptions = {

      }
    
      const web3Modal = new Web3Modal({
        network: "ropsten", // optional
        cacheProvider: true, // optional
        providerOptions // required
      });
      
      const provider = await web3Modal.connect();
      
      const web3 = new Web3(provider);

      // Use web3 to get the user's accounts.
      const getAccounts = await web3.eth.getAccounts();
      
        // Get the contract instance.
      const networkId = await web3.eth.net.getId();

      const deployedAddress = Lottery.networks[networkId].address
      const lotteryInstance = new web3.eth.Contract(
        Lottery.abi,
        deployedAddress,
      );

      const manager = await lotteryInstance.methods.manager().call();
      const players = await lotteryInstance.methods.getPlayers().call();
      const win = await lotteryInstance.methods.lastWinner().call();
      setWinner(win)
      const balance = await web3.eth.getBalance(deployedAddress);


      setManager(manager);
      setPlayers(players);
      setBalance(balance)
      setOwnerAddress(deployedAddress)

      setLottery(lotteryInstance);

      setAccount(getAccounts);
      setWeb3(web3);

      setWeb3Loaded(true);
    
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  }


  const notify = (msg, status) => {
    switch(status){
      case "success":
        return toast.success(msg, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
         
      case "error":
        return toast.error(msg, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
      default:
        return toast.dark(msg, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          });
    }
  }
 


  async function submitLottery(e){
    e.preventDefault();

    if(web3 === null){
      alert('Please connect wallet.')
      return
    }

    try {

      notify("Waiting on transaction success...", 'default')
      setEnterLoadState(true)

      await lottery.methods.enter().send({
        from: account[0],
        value: web3.utils.toWei(etherToEnter, 'ether')
      })

      const newBalance = await web3.eth.getBalance(ownerAddress);
      setBalance(newBalance)

      notify("You have been entered into the lottery!", 'success')
      setEnterLoadState(false)
    } catch (error){

      notify(error.message,'error')
      setEnterLoadState(false)

    }

   
  }

  async function pickWinner(){
    
    try {

      notify('Waiting transaction success...')

      await lottery.methods.pickWinner().send({
        from: account[0]
      })

      const win = await lottery.methods.lastWinner().call();
      setWinner(win)
      notify(`A winner has been picked ${win} `,'success')


    } catch (error){
      notify(error.message,'error')

    }
    

  }


  return (

 
    <main className="w-full h-screen p-8 flex flex-col items-center justify-center overflow-scroll bg-orange-100">
      <Head>
        <title>DEGEN LOTTERY</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <button type="button" className=" mb-4 mt-6 font-rubik text-xs w-auto p-2 bg-gray-700 text-white rounded-md" onClick={loadWeb3}>{web3Loaded ? 'Connected: ' +  account[0].slice(0,10) + "..." : "Connect Wallet"}</button>
      <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      />

          <div className="w-full sm:w-1/2 md:w-1/2 bg-orange-200 rounded-md p-6"  >
          <h2 className='text-3xl font-bold text-center my-8 font-rubik'>DEGEN LOTTERY</h2>
          <p className='text-center font-rubik'>Ropsten Network Only</p>
          <hr />
          <div className="flex flex-col items-center justify-between">
              <div className=" flex flex-col sm:flex-row items-center justify-between w-full">
              <p className=' font-rubik text-2xl font-bold text-center my-6'>Prize Pool 🏆 🏆</p>
              {web3Loaded ? (
                 <p className=" font-rubik text-2xl font-bold text-green-500"> { web3.utils.fromWei(balance, 'ether')} ether</p>
              ) : (
                <p className=" font-rubik text-2xl font-bold text-green-500"> 100 ether</p>
              )}
             

              </div>

              {web3Loaded ? (
                <p className=" font-rubik my-4 max-w-full overflow-hidden text-green-900">Last Winner: {winner}</p>
              ): (
                <p className=" font-rubik my-4 max-w-full overflow-hidden text-green-900">Last Winner:</p>
              )}
              
             
          </div>

          <hr />

          <form className="my-8" onSubmit={submitLottery}>
              <h4 className="text-xl font-bold text-center font-rubik">Want to try your luck?</h4>
              <div className="flex flex-col items-center justify-center">
                <label className="my-6 font-rubik ">Gamble Amount (in Ether)</label>
                <input className="w-full border rounded-md p-2 text-lg text-center bg-gray-800 text-white font-bold" value={etherToEnter} onChange={e=>setEtherToEnter(e.target.value)} />
              </div>

              <button className=" font-rubik w-full rounded-md my-4 p-2 bg-orange-400 font-medium " type="submit" disabled={enterLoadState}>Enter</button>
              <p className='text-center text-green-400 italic font-rubik '>{transactionMsg}</p>
          </form>

          <hr />
          <div className=" font-rubik flex flex-col items-center justify-center mt-4">
            <h2>Ready to Pick a Winner?</h2>
            <button className=" font-rubik rounded-md mt-4 p-2 bg-red-400 font-medium" type="button" onClick={pickWinner}>Pick a Winner</button>
          </div>
          
          </div>


        
    
     
     
    </main>
  )
}
