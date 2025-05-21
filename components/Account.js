import styles from "../styles/Acount.module.css";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

function Account(){
    let userEmail = useSelector((state)=>state.users.value.email)
    async function getUserbyEmail(email) {
        
        
    }


    return (
        <div className = {styles.accountContainer}>

        </div>
    )

}

export default Account