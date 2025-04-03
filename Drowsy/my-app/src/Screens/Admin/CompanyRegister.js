import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { ShowToast } from "../../components/Toast.js";
import { useNavigation } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import Error from "react-native-vector-icons/MaterialIcons";
import { useUser } from "../../context/UserContext.js";

const CompanyRegister = () => {
  const { companies, setCompanies } = useUser();
  const [companyName, setCompanyName] = useState("");
  const [companyNameVerify, setCompanyNameVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneVerify, setPhoneVerify] = useState(false);
  const [website, setWebsite] = useState("");
  const [websiteVerify, setWebsiteVerify] = useState(false);
  const [address, setAddress] = useState("");
  const [addressVerify, setAddressVerify] = useState(false);
  const navigation = useNavigation();

  function handleCompanyName(e) {
    const nameVar = e.nativeEvent.text;
    setCompanyName(nameVar);
    setCompanyNameVerify(nameVar.length >= 3);
  }

  function handleEmail(e) {
    const emailVar = e.nativeEvent.text;
    const emailPattern = /^[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setEmail(emailVar);
    setEmailVerify(emailPattern.test(emailVar));
  }

  function handlePhone(e) {
    const phoneVar = e.nativeEvent.text;
    setPhone(phoneVar);
    setPhoneVerify(/[6-9]{1}[0-9]{9}/.test(phoneVar));
  }

  function handleWebsite(e) {
    const websiteVar = e.nativeEvent.text;
    const websitePattern =
      /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+(\.[a-zA-Z]{2,})?$/;
    setWebsite(websiteVar);
    setWebsiteVerify(websiteVar === "" || websitePattern.test(websiteVar)); // Optional field
  }

  function handleAddress(e) {
    const addressVar = e.nativeEvent.text;
    setAddress(addressVar);
    setAddressVerify(addressVar.length >= 10);
  }

  const handleAddCompany = async () => {
    if (!companyName || !companyNameVerify) {
      ShowToast(
        "error",
        "Please enter a valid company name (minimum 3 characters)."
      );
      return;
    }
    if (!email || !emailVerify) {
      ShowToast("error", "Please enter a valid email address.");
      return;
    }
    if (!phone || !phoneVerify) {
      ShowToast("error", "Please enter a valid phone number.");
      return;
    }
    if (website && !websiteVerify) {
      ShowToast("error", "Please enter a valid website URL.");
      return;
    }
    if (!address || !addressVerify) {
      ShowToast(
        "error",
        "Please enter a valid address (minimum 10 characters)."
      );
      return;
    }

    const companyData = {
      name: companyName,
      email: email,
      phone: phone,
      website: website || "",
      address: address,
      password: "12345678",
      role: "company",
    };

    ShowToast("info", "Adding company...");

    axios
      .post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/register`, companyData)
      .then((res) => {
        if (res.data.status === "Ok") {
          const newCompany = res.data.data;
          setCompanies(prevCompanies => [...prevCompanies, newCompany]);
          ShowToast("success", "Company added successfully.");
          navigation.goBack();
        } else {
          ShowToast("error", res.data.data || "Failed to add company.");
        }
      })
      .catch((err) => {
        ShowToast("error", "An error occurred while adding the company.");
        console.log(err);
      });
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar backgroundColor={"#FFF"} barStyle={"dark-content"} />
      <View style={styles.container}>
        <View style={styles.formWrapper}>
          <Text style={styles.headerText}>Add New Company</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Company Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={companyName}
                onChange={handleCompanyName}
                placeholder="Enter company name"
              />
              {companyName.length > 0 &&
                (companyNameVerify ? (
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                    style={styles.icon}
                  />
                ) : (
                  <Error
                    name="error"
                    color="red"
                    size={20}
                    style={styles.icon}
                  />
                ))}
            </View>
            {!companyNameVerify && companyName.length > 0 && (
              <Text style={styles.errorText}>
                Company name should be at least 3 characters.
              </Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={email}
                onChange={handleEmail}
                placeholder="Enter company email"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {email.length > 0 &&
                (emailVerify ? (
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                    style={styles.icon}
                  />
                ) : (
                  <Error
                    name="error"
                    color="red"
                    size={20}
                    style={styles.icon}
                  />
                ))}
            </View>
            {!emailVerify && email.length > 0 && (
              <Text style={styles.errorText}>Enter a valid email address.</Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={phone}
                onChange={handlePhone}
                placeholder="Enter company phone number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {phone.length > 0 &&
                (phoneVerify ? (
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                    style={styles.icon}
                  />
                ) : (
                  <Error
                    name="error"
                    color="red"
                    size={20}
                    style={styles.icon}
                  />
                ))}
            </View>
            {!phoneVerify && phone.length > 0 && (
              <Text style={styles.errorText}>
                Phone number should start with 6-9 and be 10 digits long.
              </Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Website (Optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40 }]}
                value={website}
                onChange={handleWebsite}
                placeholder="Enter company website"
                autoCapitalize="none"
                keyboardType="url"
              />
              {website.length > 0 &&
                (websiteVerify ? (
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                    style={styles.icon}
                  />
                ) : (
                  <Error
                    name="error"
                    color="red"
                    size={20}
                    style={styles.icon}
                  />
                ))}
            </View>
            {!websiteVerify && website.length > 0 && (
              <Text style={styles.errorText}>Enter a valid website URL.</Text>
            )}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.textInput, { paddingRight: 40, height: 80 }]}
                value={address}
                onChange={handleAddress}
                placeholder="Enter company address"
                multiline={true}
                numberOfLines={3}
              />
              {address.length > 0 &&
                (addressVerify ? (
                  <Feather
                    name="check-circle"
                    color="green"
                    size={20}
                    style={styles.icon}
                  />
                ) : (
                  <Error
                    name="error"
                    color="red"
                    size={20}
                    style={styles.icon}
                  />
                ))}
            </View>
            {!addressVerify && address.length > 0 && (
              <Text style={styles.errorText}>
                Address should be at least 10 characters.
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddCompany}>
            <Text style={styles.buttonText}>Add Company</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginTop: 10,
  },
  formWrapper: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  inputWrapper: {
    width: "100%",
    marginVertical: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  inputContainer: {
    position: "relative",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 15,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CompanyRegister;
