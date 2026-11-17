import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, getDocs, collection, orderBy, query, serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

const ADMIN_UID = "t4dKudZrvTOigbwC7rFuH4XL9Mc2";
let isSignup = false;

const form = document.getElementById("authForm");
const switchBtn = document.getElementById("switchBtn");
const confirmBox = document.getElementById("confirmBox");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
const nameInput = document.getElementById("name");
const addressInput = document.getElementById("address");

nameInput.style.display = "none";
addressInput.style.display = "none";
confirmBox.style.display = "none";

function getLoginEmail(phone) {
  let number = phone.replace(/\D/g, "");
  if (number.startsWith("0")) number = "88" + number;
  return number + "@khadimul-basar.app";
}

switchBtn.onclick = function(event) {
  event.preventDefault();
  isSignup = !isSignup;
  nameInput.style.display = isSignup ? "block" : "none";
  addressInput.style.display = isSignup ? "block" : "none";
  confirmBox.style.display = isSignup ? "block" : "none";
  nameInput.required = isSignup;
  addressInput.required = isSignup;
  document.getElementById("confirmPassword").required = isSignup;
  submitBtn.textContent = isSignup ? "SIGN UP" : "LOGIN";
  document.getElementById("subtitle").textContent =
    isSignup ? "Create Your Account" : "Welcome Back!";
  switchBtn.textContent = isSignup ? "Login" : "Sign Up";
  document.getElementById("switchText").firstChild.textContent =
    isSignup ? "Already have an account? " : "Don't have an account? ";
  message.textContent = "";
};

form.onsubmit = async function(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const address = addressInput.value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!/^(\+8801|01)[3-9][0-9]{8}$/.test(phone)) {
    message.textContent = "সঠিক বাংলাদেশি মোবাইল নাম্বার দিন।";
    return;
  }
  if (isSignup && (!name || !address)) {
    message.textContent = "নাম ও ঠিকানা দিন।";
    return;
  }
  if (password.length < 6) {
    message.textContent = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।";
    return;
  }
  if (isSignup && password !== confirm) {
    message.textContent = "পাসওয়ার্ড মিলছে না!";
    return;
  }

  submitBtn.disabled = true;
  message.textContent = "অপেক্ষা করুন...";

  try {
    const email = getLoginEmail(phone);
    if (isSignup) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", result.user.uid), {
        name: name,
        phone: phone,
        address: address,
        createdAt: serverTimestamp()
      });
      await showDashboard(result.user);
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await showDashboard(result.user);
    }
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      message.textContent = "অ্যাকাউন্ট আগেই আছে। Login করুন।";
    } else if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      message.textContent = "নাম্বার বা পাসওয়ার্ড ভুল।";
    } else {
      message.textContent = error.message;
    }
  } finally {
    submitBtn.disabled = false;
  }
};

async function showDashboard(user) {
  const isAdmin = user.uid === ADMIN_UID;
  const container = document.querySelector(".container");
  container.style.maxWidth = "95%";

  container.innerHTML = `
    <h1>KHADIMUL BASAR</h1>
    <h2>${isAdmin ? "সব সদস্য" : "আপনার তথ্য"}</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ক্রমিক নং</th>
            <th>নাম্বার</th>
            <th>নাম</th>
            <th>ঠিকানা</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          <tr><td colspan="4">লোড হচ্ছে...</td></tr>
        </tbody>
      </table>
    </div>
    <button id="logoutBtn">LOGOUT</button>
  `;

  const body = document.getElementById("tableBody");

  try {
    let docs = [];
    if (isAdmin) {
      const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt")));
      snap.forEach((d) => docs.push(d));
    } else {
      const mine = await getDoc(doc(db, "users", user.uid));
      if (mine.exists()) docs.push(mine);
    }

    body.innerHTML = "";
    let i = 1;
    docs.forEach((d) => {
      const u = d.data();
      const tr = document.createElement("tr");
      [String(i++).padStart(2, "0"), u.phone, u.name, u.address].forEach((v) => {
        const td = document.createElement("td");
        td.textContent = v ?? "";
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  } catch (error) {
    body.innerHTML = "<tr><td colspan='4'>লোড করা যায়নি: " + error.message + "</td></tr>";
  }

  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    location.reload();
  };
}
