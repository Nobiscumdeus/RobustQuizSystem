import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { User, Mail, Phone,  Calendar, Camera, Edit3, Save, X, Eye, EyeOff, Award, BookOpen, Trophy, Target, Users, FileText,  CheckCircle } from "lucide-react";
import axios from "axios";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        
        if (response.data.success) {
          setUserData(response.data.data);
          setEditedData(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data", error);
        setError("Failed to fetch user data");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.put("http://localhost:5000/profile", {
        firstName: editedData.firstName,
        lastName: editedData.lastName,
        phone: editedData.phone,
        avatarUrl: editedData.avatarUrl
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        setUserData(prev => ({ ...prev, ...response.data.data }));
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({...userData});
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ProfileField = ({ icon: Icon, label, value, field, type = "text", editable = true }) => (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {isEditing && editable ? (
          type === "textarea" ? (
            <textarea
              value={editedData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="3"
            />
          ) : (
            <input
              type={type}
              value={editedData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )
        ) : (
          <p className="text-gray-800 font-medium">
            {type === "date" && value ? new Date(value).toLocaleDateString() : (value || 'Not provided')}
          </p>
        )}
      </div>
    </div>
  );

  ProfileField.propTypes = {
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    field: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["text", "email", "tel", "date", "textarea"]),
    editable: PropTypes.bool
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    color: PropTypes.string.isRequired
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600">{error || "Failed to load profile"}</p>
        </div>
      </div>
    );
  }

  // Generate stats based on role
  const getStatsForRole = () => {
    if (userData.role === 'student') {
      return [
        {
          icon: Trophy,
          title: "Exams Completed",
          value: userData.stats?.examsCompleted || 0,
          color: "bg-blue-500"
        },
        {
          icon: Target,
          title: "Average Score",
          value: `${userData.stats?.averageScore || 0}%`,
          color: "bg-green-500"
        },
        {
          icon: BookOpen,
          title: "Courses Enrolled",
          value: userData.stats?.coursesEnrolled || 0,
          color: "bg-purple-500"
        },
        {
          icon: Award,
          title: "Achievements",
          value: userData.stats?.achievements || 0,
          color: "bg-orange-500"
        }
      ];
    } else if (userData.role === 'examiner') {
      return [
        {
          icon: Users,
          title: "Students Managed",
          value: userData.stats?.studentsManaged || 0,
          color: "bg-blue-500"
        },
        {
          icon: FileText,
          title: "Exams Created",
          value: userData.stats?.examsCreated || 0,
          color: "bg-green-500"
        },
        {
          icon: BookOpen,
          title: "Courses Teaching",
          value: userData.stats?.coursesTeaching || 0,
          color: "bg-purple-500"
        },
        {
          icon: CheckCircle,
          title: "Total Submissions",
          value: userData.stats?.totalSubmissions || 0,
          color: "bg-orange-500"
        }
      ];
    }
    return [];
  };

  const stats = getStatsForRole();

  // Generate achievements based on user role and stats
  const getAchievements = () => {
    if (userData.role === 'student') {
      return [
        { 
          title: "First Quiz", 
          desc: "Completed your first quiz", 
          color: "bg-green-500", 
          earned: (userData.stats?.examsCompleted || 0) > 0 
        },
        { 
          title: "Perfect Score", 
          desc: "Scored 100% on a quiz", 
          color: "bg-yellow-500", 
          earned: (userData.stats?.averageScore || 0) >= 100 
        },
        { 
          title: "Quick Learner", 
          desc: "Completed 10 quizzes", 
          color: "bg-blue-500", 
          earned: (userData.stats?.examsCompleted || 0) >= 10 
        },
        { 
          title: "High Achiever", 
          desc: "Maintain 90% average", 
          color: "bg-purple-500", 
          earned: (userData.stats?.averageScore || 0) >= 90 
        },
        { 
          title: "Course Explorer", 
          desc: "Enrolled in 5+ courses", 
          color: "bg-indigo-500", 
          earned: (userData.stats?.coursesEnrolled || 0) >= 5 
        },
        { 
          title: "Master Student", 
          desc: "Complete 50 quizzes", 
          color: "bg-red-500", 
          earned: (userData.stats?.examsCompleted || 0) >= 50 
        }
      ];
    } else {
      return [
        { 
          title: "First Course", 
          desc: "Created your first course", 
          color: "bg-green-500", 
          earned: (userData.stats?.coursesTeaching || 0) > 0 
        },
        { 
          title: "Exam Creator", 
          desc: "Created 10+ exams", 
          color: "bg-blue-500", 
          earned: (userData.stats?.examsCreated || 0) >= 10 
        },
        { 
          title: "Popular Teacher", 
          desc: "Managing 50+ students", 
          color: "bg-purple-500", 
          earned: (userData.stats?.studentsManaged || 0) >= 50 
        },
        { 
          title: "Active Educator", 
          desc: "Teaching 5+ courses", 
          color: "bg-yellow-500", 
          earned: (userData.stats?.coursesTeaching || 0) >= 5 
        },
        { 
          title: "Assessment Pro", 
          desc: "1000+ submissions received", 
          color: "bg-indigo-500", 
          earned: (userData.stats?.totalSubmissions || 0) >= 1000 
        },
        { 
          title: "Master Educator", 
          desc: "Created 100+ exams", 
          color: "bg-red-500", 
          earned: (userData.stats?.examsCreated || 0) >= 100 
        }
      ];
    }
  };

  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-8 py-12 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              
              {/* Avatar Section */}
              <div className="relative group">
                <img
                  src={userData.avatarUrl || `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=4F46E5&color=fff&size=150`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                />
                <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </button>
                {userData.isOnline && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="text-center md:text-left text-white flex-1">
                <h1 className="text-4xl font-bold mb-2">
                  {userData.firstName} {userData.lastName}
                </h1>
                <p className="text-blue-100 text-xl mb-1">
                  {userData.role === 'student' 
                    ? `${userData.studentInfo?.department || 'Student'} • ${userData.studentInfo?.level || ''}`
                    : 'Examiner'
                  }
                </p>
                <p className="text-blue-200 mb-4">@{userData.username}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {userData.role === 'student' && userData.studentInfo?.matricNo && (
                    <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      {userData.studentInfo.matricNo}
                    </span>
                  )}
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    Member since {new Date(userData.memberSince).getFullYear()}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    Profile {userData.profileCompletion}% complete
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-lg"
                  >
                    <Edit3 className="w-5 h-5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2 shadow-lg disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors flex items-center space-x-2 shadow-lg"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'account', label: 'Account Settings', icon: Edit3 },
                { id: 'achievements', label: 'Achievements', icon: Award }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField
                      icon={User}
                      label="First Name"
                      value={userData.firstName}
                      field="firstName"
                    />
                    <ProfileField
                      icon={User}
                      label="Last Name"
                      value={userData.lastName}
                      field="lastName"
                    />
                    <ProfileField
                      icon={Mail}
                      label="Email Address"
                      value={userData.email}
                      field="email"
                      type="email"
                      editable={false}
                    />
                    <ProfileField
                      icon={Phone}
                      label="Phone Number"
                      value={userData.phone}
                      field="phone"
                      type="tel"
                    />
                    <ProfileField
                      icon={User}
                      label="Username"
                      value={userData.username}
                      field="username"
                      editable={false}
                    />
                    <ProfileField
                      icon={Calendar}
                      label="Member Since"
                      value={userData.createdAt}
                      field="createdAt"
                      type="date"
                      editable={false}
                    />
                  </div>
                  
                  {/* Role-specific information */}
                  {userData.role === 'student' && userData.studentInfo && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Student Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProfileField
                          icon={FileText}
                          label="Matric Number"
                          value={userData.studentInfo.matricNo}
                          field="matricNo"
                          editable={false}
                        />
                        <ProfileField
                          icon={BookOpen}
                          label="Department"
                          value={userData.studentInfo.department}
                          field="department"
                          editable={false}
                        />
                        <ProfileField
                          icon={Trophy}
                          label="Level"
                          value={userData.studentInfo.level}
                          field="level"
                          editable={false}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Account Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${userData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      Account is {userData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Last login: {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="font-semibold text-yellow-800 mb-4">Change Password</h4>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current Password"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h4 className="font-semibold text-red-800 mb-4">Danger Zone</h4>
                  <p className="text-red-600 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'achievements' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Achievements</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => (
                    <div key={index} className={`p-6 rounded-xl border-2 transition-all ${
                      achievement.earned 
                        ? 'bg-white border-gray-200 shadow-lg' 
                        : 'bg-gray-50 border-gray-100 opacity-50'
                    }`}>
                      <div className={`w-16 h-16 ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-800 text-center mb-2">{achievement.title}</h4>
                      <p className="text-gray-600 text-sm text-center">{achievement.desc}</p>
                      {achievement.earned && (
                        <div className="text-center mt-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Earned
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;