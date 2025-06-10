"use client";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Clock,
  Save,
  X,
  ArrowLeft,
  CheckSquare,
  Square,
  Camera,
  Users,
  Star,
  Calendar,
  Phone,
  Map,
  Info,
  AlertCircle,
} from "lucide-react";
import styles from "../pages/css/UpdateFutsalProfile.module.css";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

// Utility to extract map data from a Google Maps link
function extractMapData(mapLink) {
  let lat = null, lng = null, placeName = '', placeId = '';
  // 1. /@lat,lng
  const atMatch = mapLink.match(/@([\d.\-]+),([\d.\-]+)/);
  if (atMatch) {
    lat = atMatch[1];
    lng = atMatch[2];
  } else {
    // 2. ?q=lat,lng or &q=lat,lng
    const qMatch = mapLink.match(/[?&]q=([\d.\-]+),([\d.\-]+)/);
    if (qMatch) {
      lat = qMatch[1];
      lng = qMatch[2];
    } else {
      // 3. /place/.../lat,lng or /dir/.../lat,lng
      const placeDirMatch = mapLink.match(/\/((place|dir|search)[^\/]*)\/([\d.\-]+),([\d.\-]+)/);
      if (placeDirMatch) {
        lat = placeDirMatch[3];
        lng = placeDirMatch[4];
      } else {
        // 4. /maps?q=lat,lng
        const mapsQMatch = mapLink.match(/maps\?q=([\d.\-]+),([\d.\-]+)/);
        if (mapsQMatch) {
          lat = mapsQMatch[1];
          lng = mapsQMatch[2];
        } else {
          // 5. /maps/search/?api=1&query=lat,lng
          const apiQueryMatch = mapLink.match(/query=([\d.\-]+),([\d.\-]+)/);
          if (apiQueryMatch) {
            lat = apiQueryMatch[1];
            lng = apiQueryMatch[2];
          } else {
            // 6. !3dlat!4dlng (embed links)
            const pbCoordMatch = mapLink.match(/!3d([\d.\-]+)!4d([\d.\-]+)/);
            if (pbCoordMatch) {
              lat = pbCoordMatch[1];
              lng = pbCoordMatch[2];
            }
          }
        }
      }
    }
  }
  // Place name (if present)
  const placeMatch = mapLink.match(/\/place\/([^/]+)/);
  if (placeMatch) {
    placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  }
  // Place ID (if present)
  const placeIdMatch = mapLink.match(/[?&]place_id=([^&]+)/);
  if (placeIdMatch) {
    placeId = placeIdMatch[1];
  }
  return {
    latitude: lat ? Number(lat) : undefined,
    longitude: lng ? Number(lng) : undefined,
    placeName,
    placeId
  };
}

const UpdateFutsal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createFutsal, updateFutsalPage, fetchFutsals } = useAuthStore();
  const isCreating = location.state?.isCreating;
  const futsalId = location.state?.futsalId;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    openingHoursFrom: "",
    openingHoursTo: "",
    description: "",
    ownerName: "",
    ownerDescription: "",
    phoneNumber: "",
    plusPoints: [],
    mapLink: "",
    futsalPhoto: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    const loadFutsalData = async () => {
      if (!isCreating && futsalId) {
        setIsLoading(true);
        try {
          const res = await fetchFutsals();
          const futsal = res.message.find(f => f._id === futsalId);
          if (futsal) {
            const [from, to] = (futsal.openingHours || "").split(" - ");
            setFormData({
              name: futsal.name || "",
              location: futsal.location || "",
              openingHoursFrom: from || "",
              openingHoursTo: to || "",
              description: futsal.description || "",
              ownerName: futsal.ownerName || "",
              ownerDescription: futsal.ownerDescription || "",
              phoneNumber: futsal.phoneNumber || "",
              plusPoints: futsal.plusPoints || [],
              mapLink: futsal.mapLink || "",
              futsalPhoto: futsal.futsalPhoto || "",
            });
          }
        } catch (error) {
          toast.error("Failed to load futsal data");
          navigate('/organizer-futsals');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadFutsalData();
  }, [isCreating, futsalId, fetchFutsals, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (facility) => {
    setFormData((prev) => ({
      ...prev,
      plusPoints: prev.plusPoints.includes(facility)
        ? prev.plusPoints.filter(f => f !== facility)
        : [...prev.plusPoints, facility]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          futsalPhoto: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        openingHours: `${formData.openingHoursFrom} - ${formData.openingHoursTo}`
      };
      delete submitData.openingHoursFrom;
      delete submitData.openingHoursTo;
      // Extract map data and add to submitData
      if (formData.mapLink) {
        const mapData = extractMapData(formData.mapLink);
        submitData.latitude = mapData.latitude;
        submitData.longitude = mapData.longitude;
        submitData.placeName = mapData.placeName;
        submitData.placeId = mapData.placeId;
      }
      if (isCreating) {
        await createFutsal(submitData);
        toast.success('Futsal created successfully');
      } else {
        await updateFutsalPage(futsalId, submitData);
        toast.success('Futsal updated successfully');
      }
      navigate('/organizer-futsals');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = (sectionId, title, icon) => (
    <div 
      className={`${styles.sectionTab} ${activeSection === sectionId ? styles.active : ''}`}
      onClick={() => setActiveSection(sectionId)}
    >
      {icon}
      <span>{title}</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading futsal data...</p>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={styles.mainHeader}>
        <div className={styles.titleWithBack}>
          <Link to="/organizer-futsals" className={styles.backButton}>
            <ArrowLeft size={18} />
          </Link>
          <h1>{isCreating ? 'Create New Futsal' : 'Update Futsal'}</h1>
        </div>
        <button 
          type="submit" 
          form="updateFutsalForm" 
          className={styles.saveButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className={styles.spinner}></div>
              {isCreating ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save size={16} />
              {isCreating ? 'Create Futsal' : 'Save Changes'}
            </>
          )}
        </button>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.sidebar}>
          {renderSection("basic", "Basic Information", <Info size={18} />)}
          {renderSection("about", "About Futsal", <Star size={18} />)}
          {renderSection("facilities", "Facilities", <CheckSquare size={18} />)}
          {renderSection("map", "Location Map", <Map size={18} />)}
        </div>

        <form id="updateFutsalForm" className={styles.updateForm} onSubmit={handleSubmit}>
          {activeSection === "basic" && (
            <div className={styles.formSection}>
              <h2>Basic Information</h2>
              <div className={styles.bannerUpload}>
                <div
                  className={styles.imagePreview}
                  style={{ backgroundImage: `url(${formData.futsalPhoto || '/images/futsal-court.jpg'})` }}
                >
                  <label className={styles.uploadLabel}>
                    <input type="file" accept="image/*" onChange={handleImageChange} className={styles.fileInput} />
                    <div className={styles.uploadIcon}>
                      <Camera size={24} />
                      <span>Update Futsal Photo</span>
                    </div>
                  </label>
                </div>
                <p className={styles.imageNote}>Recommended size: 1200x800px, Max size: 5MB</p>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="name">Futsal Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Enter your futsal name"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="location">Location</label>
                <div className={styles.iconInput}>
                  <MapPin size={16} />
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Enter your futsal location"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Opening Hours</label>
                <div className={styles.timeInputs}>
                  <div className={styles.timeInputGroup}>
                    <label htmlFor="openingHoursFrom">From</label>
                    <div className={styles.timePicker}>
                      <select 
                        id="openingHoursFrom" 
                        name="openingHoursFrom" 
                        value={formData.openingHoursFrom} 
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <option key={`from-${hour}`} value={`${hour}:00`}>
                              {`${hour}:00`}
                            </option>
                          );
                        })}
                      </select>
                      <Clock size={16} className={styles.timeIcon} />
                    </div>
                  </div>
                  <div className={styles.timeInputGroup}>
                    <label htmlFor="openingHoursTo">To</label>
                    <div className={styles.timePicker}>
                      <select 
                        id="openingHoursTo" 
                        name="openingHoursTo" 
                        value={formData.openingHoursTo} 
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <option key={`to-${hour}`} value={`${hour}:00`}>
                              {`${hour}:00`}
                            </option>
                          );
                        })}
                      </select>
                      <Clock size={16} className={styles.timeIcon} />
                    </div>
                  </div>
                </div>
                <p className={styles.fieldNote}>
                  <Clock size={14} />
                  Select your futsal's operating hours. Slots will be automatically generated within these hours.
                </p>
              </div>
            </div>
          )}

          {activeSection === "about" && (
            <div className={styles.formSection}>
              <h2>About Futsal</h2>
              <div className={styles.formGroup}>
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={6} 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Describe your futsal, its features, and what makes it special..."
                />
                <p className={styles.fieldNote}>Provide a detailed description of your futsal to attract more customers</p>
              </div>
            </div>
          )}

          {activeSection === "facilities" && (
            <div className={styles.formSection}>
              <h2>Facilities</h2>
              <p className={styles.sectionNote}>Select all the facilities available at your futsal</p>
              <div className={styles.facilitiesGrid}>
                {[
                  "Refund Policy",
                  "Premium Turf",
                  "Changing Rooms",
                  "Online Payment",
                  "Tournament Hosting",
                  "Parking",
                  "Cafeteria",
                  "Equipment Rental"
                ].map((facility) => (
                  <div 
                    key={facility} 
                    className={`${styles.facilityItem} ${formData.plusPoints.includes(facility) ? styles.selected : ''}`}
                    onClick={() => handleFacilityChange(facility)}
                  >
                    {formData.plusPoints.includes(facility) ? (
                      <CheckSquare size={20} className={styles.checkIcon} />
                    ) : (
                      <Square size={20} />
                    )}
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "map" && (
            <div className={styles.formSection}>
              <h2>Location Map</h2>
              <div className={styles.formGroup}>
                <label htmlFor="mapLink">Google Maps Link</label>
                <div className={styles.iconInput}>
                  <Map size={16} />
                  <input 
                    type="text" 
                    id="mapLink" 
                    name="mapLink" 
                    value={formData.mapLink} 
                    onChange={handleInputChange} 
                    placeholder="Paste your Google Maps link here (get it from Share > Copy Link)"
                  />
                  <a
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mapSelectBtn}
                    style={{ marginLeft: 12, color: '#2563eb', fontWeight: 600, textDecoration: 'underline', fontSize: 14 }}
                  >
                    Select on Map
                  </a>
                </div>
                <p className={styles.fieldNote}>
                  <AlertCircle size={16} />
                  Open Google Maps, find your futsal, click Share, and copy the link. Paste it here.
                </p>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <Link to="/organizer-futsals" className={styles.cancelButton}>
              <X size={16} /> Cancel
            </Link>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  {isCreating ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isCreating ? 'Create Futsal' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFutsal;