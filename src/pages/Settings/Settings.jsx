import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import "./Settings.css";
import FinanceParticles from "../../Componentes/FinanceParticles/FinanceParticles";
import { updateProfile } from "../../Service/UserService";

const Settings = () => {
  const { auth, shopProfile, setShopProfile, headerName, favicon, updateBranding, settings, updateSettings } = useContext(AppContext);

  const isSuperAdmin = auth?.role === "ROLE_SUPERADMIN";
  const isShopOwner = auth?.role === "ROLE_SHOPOWNER";

  const [activeTab, setActiveTab] = useState("profile");

  // Portal Branding States
  const [tempHeaderName, setTempHeaderName] = useState(headerName);
  const [tempFavicon, setTempFavicon] = useState(favicon);
  const [previewUrl, setPreviewUrl] = useState(favicon);

  // Billing Settings States
  const [billingSettings, setBillingSettings] = useState({
    enableGst: true,
    enableDiscount: true,
    defaultGst: 18
  });

  useEffect(() => {
    if (settings) {
      setBillingSettings({
        enableGst: settings.enableGst,
        enableDiscount: settings.enableDiscount,
        defaultGst: settings.defaultGst
      });
    }
  }, [settings]);

  const handleBillingSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBillingSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
    shopName: "",
    shopAddress: "",
    shopWebsite: "",
    shopMobile: "",
    shopEmail: "",
    gstNumber: "",
    whatsappAutoSend: false
  });
  const [profileImage, setProfileImage] = useState(false);
  const [shopLogoImage, setShopLogoImage] = useState(false);
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [brandingLoading, setBrandingLoading] = useState(false);

  useEffect(() => {
    setTempHeaderName(headerName);
    setTempFavicon(favicon);
    setPreviewUrl(favicon);
  }, [headerName, favicon]);

  useEffect(() => {
    if (shopProfile) {
      setProfileData({
        name: shopProfile.name || '',
        email: shopProfile.email || '',
        password: '',
        shopName: shopProfile.shopName || '',
        shopAddress: shopProfile.shopAddress || '',
        shopWebsite: shopProfile.shopWebsite || '',
        shopMobile: shopProfile.shopMobile || '',
        shopEmail: shopProfile.shopEmail || '',
        gstNumber: shopProfile.gstNumber || '',
        whatsappAutoSend: shopProfile.whatsappAutoSend || false
      });
    }
  }, [shopProfile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Validate size (max 2MB to keep localStorage clean)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setTempFavicon(base64String);
      setPreviewUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleBrandingSave = (e) => {
    e.preventDefault();
    if (!tempHeaderName.trim()) {
      toast.error("Header name cannot be empty");
      return;
    }

    updateBranding(tempHeaderName, tempFavicon);
    toast.success("Portal branding updated successfully!");
  };

  const handleBrandingReset = () => {
    updateBranding("GSTBLIZ", null);
    setTempHeaderName("GSTBLIZ");
    setTempFavicon(null);
    setPreviewUrl(null);
    toast.success("Branding reset to system default.");
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    updateSettings({
      enableGst: billingSettings.enableGst,
      enableDiscount: billingSettings.enableDiscount,
      defaultGst: parseFloat(billingSettings.defaultGst || "0")
    });

    const formData = new FormData();
    formData.append("user", JSON.stringify({
      name: profileData.name,
      email: profileData.email,
      password: profileData.password,
      shopName: profileData.shopName,
      shopAddress: profileData.shopAddress,
      shopWebsite: profileData.shopWebsite,
      shopMobile: profileData.shopMobile,
      shopEmail: profileData.shopEmail,
      gstNumber: profileData.gstNumber,
      whatsappAutoSend: profileData.whatsappAutoSend
    }));
    
    if (shopLogoImage) {
      formData.append("file", shopLogoImage);
    }
    if (profileImage) {
      formData.append("profilePhoto", profileImage);
    }

    try {
      const response = await updateProfile(formData);
      setShopProfile(response.data);
      toast.success("Profile settings updated successfully!");
      setProfileData(prev => ({ ...prev, password: '' }));
      setProfileImage(false);
      setShopLogoImage(false);
    } catch (err) {
      console.error(err);
      toast.error("Unable to update profile settings.");
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="settings-wrapper position-relative overflow-hidden">
      {/* Subtle floating particles background */}
      <FinanceParticles opacityMultiplier={0.25} speedMultiplier={0.4} />

      <div className="settings-container position-relative z-3">
        
        {/* Settings Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="settings-icon-box">
            <i className="bi bi-gear text-indigo fs-4"></i>
          </div>
          <div>
            <h2 className="settings-main-title mb-0">Settings</h2>
            <p className="text-muted fs-7 mb-0">Manage your profile details and portal configurations</p>
          </div>
        </div>

        {/* Tab Selection (only show to Super Admin) */}
        {isSuperAdmin && (
          <div className="settings-tabs mb-4">
            <button
              className={`settings-tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <i className="bi bi-person-circle text-indigo"></i>
              Profile Settings
            </button>
            <button
              className={`settings-tab-btn ${activeTab === "branding" ? "active" : ""}`}
              onClick={() => setActiveTab("branding")}
            >
              <i className="bi bi-sliders text-emerald"></i>
              System Branding
            </button>
          </div>
        )}

        {/* Active Tab rendering */}
        {(activeTab === "profile" || !isSuperAdmin) && (
          <div className="row g-4">
            {/* LEFT PROFILE PANEL */}
            <div className="col-12 col-md-7">
              <div className="glass-panel settings-card p-4 p-sm-5 h-100">
                <h4 className="card-section-title mb-4">
                  <i className="bi bi-person-fill text-indigo me-2"></i>
                  Account Information
                </h4>
                
                <form onSubmit={handleProfileSave}>
                  <div className="mb-3">
                    <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control finance-input w-100"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control finance-input w-100"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Password (Leave blank to keep unchanged)</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control finance-input w-100"
                      placeholder="Enter new password"
                      value={profileData.password}
                      onChange={handleProfileChange}
                    />
                  </div>

                  {/* SHOP DETAILS SECTION FOR SHOP OWNER */}
                  {isShopOwner && (
                    <>
                      <h5 className="text-warning border-top pt-4 mb-4 border-secondary card-section-title">
                        <i className="bi bi-shop me-2"></i>
                        Shop Details
                      </h5>

                      <div className="mb-3">
                        <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Shop Name</label>
                        <input
                          type="text"
                          name="shopName"
                          className="form-control finance-input w-100"
                          value={profileData.shopName}
                          onChange={handleProfileChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Shop Address</label>
                        <input
                          type="text"
                          name="shopAddress"
                          className="form-control finance-input w-100"
                          value={profileData.shopAddress}
                          onChange={handleProfileChange}
                        />
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                          <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Shop Mobile</label>
                          <input
                            type="text"
                            name="shopMobile"
                            className="form-control finance-input w-100"
                            value={profileData.shopMobile}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Shop Email</label>
                          <input
                            type="email"
                            name="shopEmail"
                            className="form-control finance-input w-100"
                            value={profileData.shopEmail}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6">
                          <label className="form-label text-muted fs-8 fw-semibold text-uppercase">Shop Website</label>
                          <input
                            type="text"
                            name="shopWebsite"
                            className="form-control finance-input w-100"
                            value={profileData.shopWebsite}
                            onChange={handleProfileChange}
                          />
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="form-label text-muted fs-8 fw-semibold text-uppercase">GST Number</label>
                          <input
                            type="text"
                            name="gstNumber"
                            className="form-control finance-input w-100"
                            placeholder="E.g. 22AAAAA1111A1Z1"
                            value={profileData.gstNumber}
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>

                      <h5 className="text-info border-top pt-4 mb-4 border-secondary card-section-title">
                        <i className="bi bi-gear-wide-connected me-2"></i>
                        Billing & Tax Configurations
                      </h5>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            id="enableGst"
                            name="enableGst"
                            className="form-check-input"
                            checked={billingSettings.enableGst}
                            onChange={handleBillingSettingsChange}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                          <label htmlFor="enableGst" className="form-check-label text-muted fs-8 fw-semibold text-uppercase cursor-pointer mb-0">Enable GST Feature</label>
                        </div>
                        <div className="col-12 col-sm-6 d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            id="enableDiscount"
                            name="enableDiscount"
                            className="form-check-input"
                            checked={billingSettings.enableDiscount}
                            onChange={handleBillingSettingsChange}
                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                          />
                          <label htmlFor="enableDiscount" className="form-check-label text-muted fs-8 fw-semibold text-uppercase cursor-pointer mb-0">Enable Discount Feature</label>
                        </div>
                      </div>

                      {billingSettings.enableGst && (
                        <div className="mb-3">
                          <label htmlFor="defaultGst" className="form-label text-muted fs-8 fw-semibold text-uppercase">Default GST Percentage (%)</label>
                          <input
                            type="number"
                            id="defaultGst"
                            name="defaultGst"
                            className="form-control finance-input w-100"
                            placeholder="18"
                            min="0"
                            max="100"
                            value={billingSettings.defaultGst}
                            onChange={handleBillingSettingsChange}
                          />
                        </div>
                      )}


                    </>
                  )}

                  <div className="mt-5">
                    <button type="submit" className="btn btn-primary settings-save-btn px-4 py-2.5 fw-bold w-100 w-sm-auto" disabled={profileLoading}>
                      {profileLoading ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT PHOTO PANEL */}
            <div className="col-12 col-md-5">
              <div className="glass-panel settings-card p-4 p-sm-5 d-flex flex-column gap-5 h-100">
                
                {/* Profile Photo Uploader */}
                <div className="text-center">
                  <h4 className="card-section-title mb-4 text-start">
                    <i className="bi bi-image text-indigo me-2"></i>
                    Profile Avatar
                  </h4>

                  <div className="d-flex flex-column align-items-center my-3">
                    <div className="profile-photo-preview-box mb-3 shadow-md">
                      {profileImage ? (
                        <img src={URL.createObjectURL(profileImage)} alt="Profile Preview" className="profile-photo-preview-img" />
                      ) : shopProfile?.profilePhotoUrl ? (
                        <img src={shopProfile.profilePhotoUrl} alt="Profile" className="profile-photo-preview-img" />
                      ) : (
                        <div className="favicon-preview-fallback">
                          <i className="bi bi-person-fill fs-1 text-muted"></i>
                        </div>
                      )}
                    </div>
                    <label htmlFor="profilePhotoInput" className="btn btn-sm btn-outline-secondary cursor-pointer px-3 py-1.5 fs-8">
                      <i className="bi bi-upload me-1"></i> Upload Photo
                    </label>
                    <input
                      type="file"
                      id="profilePhotoInput"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => setProfileImage(e.target.files[0])}
                    />
                  </div>
                  <p className="text-muted fs-8 mb-0">
                    Recommended: Square format. PNG, JPG. Max size: 2MB.
                  </p>
                </div>

                {/* Shop Logo Uploader (Only visible if shop owner) */}
                {isShopOwner && (
                  <div className="text-center border-top pt-4 border-secondary">
                    <h4 className="card-section-title mb-4 text-start">
                      <i className="bi bi-building text-emerald me-2"></i>
                      Shop Logo
                    </h4>

                    <div className="d-flex flex-column align-items-center my-3">
                      <div className="favicon-preview-box mb-3 shadow-md d-flex align-items-center justify-content-center" style={{ borderRadius: '8px' }}>
                        {shopLogoImage ? (
                          <img src={URL.createObjectURL(shopLogoImage)} alt="Logo Preview" className="favicon-preview-img" />
                        ) : shopProfile?.shopLogoUrl ? (
                          <img src={shopProfile.shopLogoUrl} alt="Shop Logo" className="favicon-preview-img" />
                        ) : (
                          <div className="favicon-preview-fallback">
                            <i className="bi bi-building fs-2 text-muted"></i>
                          </div>
                        )}
                      </div>
                      <label htmlFor="shopLogoInput" className="btn btn-sm btn-outline-secondary cursor-pointer px-3 py-1.5 fs-8">
                        <i className="bi bi-upload me-1"></i> Upload Logo
                      </label>
                      <input
                        type="file"
                        id="shopLogoInput"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => setShopLogoImage(e.target.files[0])}
                      />
                    </div>
                    <p className="text-muted fs-8 mb-0">
                      Displays on billing receipts. PNG, JPG. Max size: 2MB.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* System Branding Tab content */}
        {isSuperAdmin && activeTab === "branding" && (
          <div className="row g-4">
            {/* LEFT COLUMN: Header Name Settings */}
            <div className="col-12 col-md-7">
              <div className="glass-panel settings-card p-4 p-sm-5 h-100">
                <h4 className="card-section-title mb-4">
                  <i className="bi bi-window-sidebar text-indigo me-2"></i>
                  Header Configurations
                </h4>
                
                <form onSubmit={handleBrandingSave}>
                  <div className="mb-4">
                    <label htmlFor="headerName" className="form-label text-muted fs-7 fw-semibold mb-2 text-uppercase">
                      Software Header Name
                    </label>
                    <input
                      type="text"
                      id="headerName"
                      className="form-control finance-input w-100"
                      placeholder="Enter branding name (e.g., GSTBLIZ)"
                      value={tempHeaderName}
                      onChange={(e) => setTempHeaderName(e.target.value)}
                      required
                    />
                    <div className="form-text text-muted fs-8 mt-2">
                      This updates the title shown in the top navigation menu, secure login screens, and title metadata.
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-5">
                    <button type="submit" className="btn btn-primary settings-save-btn px-4 py-2.5 fw-bold">
                      Save Changes
                    </button>
                    <button type="button" className="btn btn-outline-danger settings-reset-btn px-4 py-2.5 fw-bold" onClick={handleBrandingReset}>
                      Reset Default
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Favicon Uploader */}
            <div className="col-12 col-md-5">
              <div className="glass-panel settings-card p-4 p-sm-5 text-center d-flex flex-column justify-content-between h-100">
                <div>
                  <h4 className="card-section-title mb-4 text-start">
                    <i className="bi bi-image text-emerald me-2"></i>
                    Favicon Asset
                  </h4>

                  <div className="d-flex flex-column align-items-center my-4">
                    <div className="favicon-preview-box mb-3 shadow-md d-flex align-items-center justify-content-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Favicon Preview" className="favicon-preview-img" />
                      ) : (
                        <div className="favicon-preview-fallback">
                          <i className="bi bi-globe fs-2 text-muted"></i>
                        </div>
                      )}
                    </div>
                    <span className="text-muted fs-8">Favicon Preview</span>
                  </div>
                </div>

                <div>
                  <div className="mb-3">
                    <label htmlFor="faviconFile" className="btn support-capsule-btn w-100 cursor-pointer d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-upload"></i>
                      Upload New Asset
                    </label>
                    <input
                      type="file"
                      id="faviconFile"
                      accept="image/*"
                      className="d-none"
                      onChange={handleFileChange}
                    />
                  </div>
                  <p className="text-muted fs-8 mb-0">
                    Recommended size: 64x64px. Supports PNG, JPG, or ICO. Max size: 2MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
