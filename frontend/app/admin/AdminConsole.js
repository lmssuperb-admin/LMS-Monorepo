"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  BookOpen,
  ShieldCheck,
  Search,
  Plus,
  Activity,
  Loader2,
  MoreVertical,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  Database,
  UserPlus,
  Mail,
  MapPin,
  Key,
  Lock,
  CheckSquare,
  Square,
  ChevronDown,
  Info,
  Camera,
  PlusCircle,
  Tag,
  Phone,
  Home,
  Building,
  LayoutGrid,
  ScrollText,
  Building2,
  Smartphone,
  Type,
  List,
  Link,
  Image,
  Video,
  UploadCloud,
  ChevronUp,
  FilePlus,
  Sparkles,
  Play,
  FileText,
  BrainCircuit,
  PenTool,
  HelpCircle,
  FolderOpen,
  Check,
  LayoutDashboard,
  Bell,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Sliders,
  Bold,
  Italic,
  ListOrdered,
  Undo,
  Scissors,
  FileImage,
  Mic,
  Webcam,
  Accessibility,
  AlertCircle,
  BellRing,
  GraduationCap,
  Rocket,
  Settings,
  Upload,
  Minus,
  UserCheck,
  UserX,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

function formatLastAccessDetailed(seconds) {
  if (!seconds || seconds === 0) return "Never";
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 0) return "Just now";
  if (diff < 60) return diff === 1 ? "1 sec" : `${diff} secs`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins`;
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const rem = days % 365;
    return `${years} year${years > 1 ? "s" : ""} ${rem} Days`;
  }
  if (days > 0) return `${days} Days ${hours} hours`;
  return `${hours} hours`;
}

function formatRelativeTime(seconds) {
  if (!seconds || seconds === 0) return "Never logged in";
  const diff = Math.floor(Date.now() / 1000) - seconds;
  if (diff < 0) return "Just now";
  if (diff < 60) return `${diff} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(seconds * 1000).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLastAccessDisplay(val) {
  if (!val && val !== 0) return "Never";
  let date = null;
  if (typeof val === "number") {
    // if value looks like milliseconds (large), use directly, else treat as seconds
    if (val > 1e12) date = new Date(val);
    else date = new Date(val * 1000);
  } else if (typeof val === "string") {
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) date = new Date(parsed);
  }
  if (!date || isNaN(date.getTime())) return "Never";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const NOTIFICATION_TAGS = [
  "{user_fullname}",
  "{learningpath_name}",
  "{learningpath_startdate}",
  "{learningpath_enddate}",
  "{learningpath_coursesrequired}",
];

const defaultPathNotifications = () => ({
  enrollment: {
    enabled: false,
    subject: "Welcome to {learningpath_name}",
    body: "",
  },
  expiration: {
    enabled: false,
    subject: "Learning path expiring soon",
    body: "",
  },
  enrollmentReminder: {
    enabled: false,
    subject: "Enrollment Reminder",
    daysAfterEnrollment: 3,
    body: "",
  },
  expirationReminder: {
    enabled: false,
    subject: "Expiration Reminder",
    daysBeforeExpiration: 7,
    body: "",
  },
  completionReminder: {
    enabled: false,
    subject: "Completion Reminder",
    dayFrequency: 7,
    body: "",
  },
  pathCompletion: {
    enabled: false,
    subject: "Congratulations — path completed",
    body: "",
  },
});

export default function MasterAdminConsole() {
  const [mainTab, setMainTab] = useState("dashboard");
  const [subTab, setSubTab] = useState("Overview");
  const [data, setData] = useState({
    users: [],
    courses: [],
    categories: [],
    cohorts: [],
    roles: [],
    systemAssignments: [],
    learningpaths: [],
    announcements: [
      {
        id: 1,
        title: "Launch Of New Semester",
        author: "Admin User",
        date: "2026-04-27T10:24",
      },
      {
        id: 2,
        title: "General Notification",
        author: "Admin User",
        date: "2026-04-27T08:27",
      },
      {
        id: 3,
        title: "Webinar - AI is Future",
        author: "Admin User",
        date: "2026-04-22T20:00",
      },
    ],
    events: [
      {
        id: 1,
        name: "Weekly Sync",
        time: "10:00 AM",
        date: "2026-04-22",
        status: "Offline",
      },
      {
        id: 2,
        name: "A - Demo Course",
        time: "10:00 AM - 11:00 AM",
        date: "2026-04-22",
        status: "Offline",
      },
      {
        id: 3,
        name: "Project Review",
        time: "02:00 PM",
        date: "2026-04-25",
        status: "Online",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [modalSection, setModalSection] = useState("general");
  const fileInputRef = useRef(null);
  const activityFileInputRef = useRef(null);
  const posterImageInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [learningPaths, setLearningPaths] = useState([]);
  const [editingPath, setEditingPath] = useState(null);
  const [newPathForm, setNewPathForm] = useState({
    name: "",
    description: "",
    credits: "0",
    startDate: "",
    endDate: "",
    enableStart: false,
    enableEnd: false,
    selfEnrollment: false,
    location: "",
    instructor: "",
    image: null,
    certificate: null,
  });
  const [showPathModal, setShowPathModal] = useState(false);
  const [pathStep, setPathStep] = useState(1);
  const [pathSubTab, setPathSubTab] = useState("Overview");
  const [pathSuccess, setPathSuccess] = useState(false);
  const [isAddingCourses, setIsAddingCourses] = useState(false);
  const [isAddingUsers, setIsAddingUsers] = useState(false);
  const [cohortSearchQuery, setCohortSearchQuery] = useState("");
  const [selectedCohortIds, setSelectedCohortIds] = useState([]);
  const [showCohortModal, setShowCohortModal] = useState(false);
  const [cohortForm, setCohortForm] = useState({ name: "", description: "" });
  const [pathNotifications, setPathNotifications] = useState(
    defaultPathNotifications,
  );
  const [selectedPathCourses, setSelectedPathCourses] = useState([]);
  const [selectedPathUsers, setSelectedPathUsers] = useState([]);
  const [selectedPathCohorts, setSelectedPathCohorts] = useState([]);
  const [showUserFilter, setShowUserFilter] = useState(false);
  const [userFilters, setUserFilters] = useState({
    fullName: "",
    email: "",
    username: "",
    city: "",
    country: "",
    course: "",
    systemRole: "",
  });
  const [tempUserFilters, setTempUserFilters] = useState({ ...userFilters });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userManageStats, setUserManageStats] = useState(null);
  const [manageUsers, setManageUsers] = useState([]);
  const [userPagination, setUserPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [userSort, setUserSort] = useState({ field: "firstname", dir: "asc" });
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  // removed multitenant toggle (not needed)
  const [roleForm, setRoleForm] = useState({
    userid: "",
    roleid: "",
    contextlevel: "system",
    instanceid: 0,
  });

  const [courseForm, setCourseForm] = useState({
    fullname: "",
    categoryid: "",
    summary: "",
    imageurl: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parent: "0",
    idnumber: "",
    description: "",
  });
  const [courseStep, setCourseStep] = useState(1);
  const [courseTopics, setCourseTopics] = useState([
    { id: 1, name: "Topic 1", activities: [] },
    { id: 2, name: "Topic 2", activities: [] },
    { id: 3, name: "Topic 3", activities: [] },
  ]);
  const [enrolledUserIds, setEnrolledUserIds] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [modalRole, setModalRole] = useState(5);
  const [enrolledRoles, setEnrolledRoles] = useState({});
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [activeTopicId, setActiveTopicId] = useState(1);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [activeCourseView, setActiveCourseView] = useState("dashboard");
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [activities, setActivities] = useState([
    { id: 1, name: "Basics Of Java", type: "book", topic: 1 },
  ]);
  const [newActivityForm, setNewActivityForm] = useState({
    name: "",
    description: "",
  });
  const [videoActivityForm, setVideoActivityForm] = useState({
    name: "",
    description: "",
    displayDescription: false,
    videoType: "upload", // 'upload' or 'link'
    videoUrl: "",
    playerSizeWidth: "800",
    playerSizeHeight: "500",
    moveForward: false,
    responsive: true,
    posterImageUrl: "",
    captions: "",
    completionTracking: "manual", // 'none', 'manual', 'conditions'
    requireView: false,
    courseCompletion: false,
    completionDate: "",
    completionDateEnabled: false,
    restrictions: [],
  });

  const [pdfActivityForm, setPdfActivityForm] = useState({
    name: "",
    description: "",
    displayDescription: false,
    displayContents: "separate", // 'separate' or 'inline'
    showSubfolders: true,
    openInNewTab: true,
    pdfUrl: "",
    completionTracking: "manual",
    requireView: false,
    courseCompletion: false,
    completionDate: "",
    completionDateEnabled: false,
    restrictions: [],
  });
  const [activeAdvancedSection, setActiveAdvancedSection] = useState("video");
  const [selectedEventDay, setSelectedEventDay] = useState(null);
  const [dashboardTab, setDashboardTab] = useState("all");
  const [dashboardPage, setDashboardPage] = useState(1);
  const coursesPerPage = 4;

  const [form, setForm] = useState({
    username: "",
    auth: "manual",
    suspended: false,
    generatepass: false,
    password: "",
    forcechange: false,
    firstname: "",
    lastname: "",
    email: "",
    visibility: "1",
    city: "",
    country: "IN",
    timezone: "99",
    lang: "en",
    description: "",
    idnumber: "",
    institution: "",
    department: "",
    phone1: "",
    phone2: "",
    address: "",
    profileimageurl: "",
    roleid: "",
    cohortIds: [],
  });

  useEffect(() => {
    fetchTabData();
  }, [mainTab, subTab, courseStep]);

  useEffect(() => {
    if (pathStep === 2 && pathSubTab === "Cohorts") {
      fetchCohortsList();
    }
  }, [pathStep, pathSubTab]);

  useEffect(() => {
    if (pathStep === 2 && pathSubTab === "Notifications" && editingPath?.id) {
      loadPathNotifications(editingPath.id);
    }
  }, [pathStep, pathSubTab, editingPath?.id]);

  useEffect(() => {
    if (subTab !== "Manage users") return;
    const timer = setTimeout(() => fetchManageUsers(), searchQuery ? 350 : 0);
    return () => clearTimeout(timer);
  }, [subTab, currentPage, itemsPerPage, searchQuery, userSort]);

  const { data: session } = useSession();

  // hide currently signed-in admin from Manage Users list so admin cannot suspend themselves
  const visibleManageUsers = manageUsers.filter(
    (u) => u.id !== session?.user?.id && u.role !== "admin",
  );

  const fetchTabData = async () => {
    // ðŸ§  Abort previous fetch if still running
    if (window.fetchController) window.fetchController.abort();
    window.fetchController = new AbortController();
    const { signal } = window.fetchController;

    setLoading(true);
    try {
      // ðŸ  Dashboard Data Fetching (Real Data aggregation)
      if (mainTab === "dashboard") {
        const [usersRes, coursesRes, eventsRes] = await Promise.all([
          fetch(`http://localhost:4000/api/users`, { signal }).then((r) =>
            r.json(),
          ),
          fetch(`http://localhost:4000/api/courses`, { signal }).then((r) =>
            r.json(),
          ),
          fetch(`http://localhost:4000/api/system/calendar`, { signal }).then(
            (r) => r.json(),
          ),
        ]);

        setData((prev) => ({
          ...prev,
          users: Array.isArray(usersRes) ? usersRes : usersRes?.users || [],
          courses: Array.isArray(coursesRes)
            ? coursesRes
            : coursesRes?.courses || [],
          events: Array.isArray(eventsRes)
            ? eventsRes.map((e) => ({
                id: e.id,
                day: new Date(e.timestart * 1000).getDate(),
                month: new Date(e.timestart * 1000).getMonth(),
                year: new Date(e.timestart * 1000).getFullYear(),
                time: new Date(e.timestart * 1000).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }),
                title: e.name,
                location: e.location || "Online",
                type: e.eventtype,
              }))
            : [],
        }));
      }

      let endpoint = "";
      if (subTab === "Manage courses" || subTab === "Add course")
        endpoint = "courses";
      else if (subTab === "Define roles" || subTab === "Assign system roles")
        endpoint = "roles";
      else if (subTab === "Manage cohorts") {
        const cohortRes = await fetch(`http://localhost:4000/api/cohorts`, {
          signal,
        }).then((r) => r.json());
        setData((prev) => ({
          ...prev,
          cohorts: Array.isArray(cohortRes) ? cohortRes : [],
        }));
      } else if (subTab === "Learning Paths" || subTab === "Add Path") {
        endpoint = "learningpaths";
        // Also need courses for selection if adding path
        if (subTab === "Add Path") {
          const cRes = await fetch(`http://localhost:4000/api/courses`, {
            signal,
          }).then((r) => r.json());
          setData((prev) => ({
            ...prev,
            courses: Array.isArray(cRes) ? cRes : cRes.courses || [],
          }));
        }
      }

      // ðŸ”„ Ensure users and their roles are fetched for enrollment step in Add Course
      if (subTab === "Add course") {
        const [userRes, assignRes] = await Promise.all([
          fetch(`http://localhost:4000/api/users`, { signal }).then((r) =>
            r.json(),
          ),
          fetch(`http://localhost:4000/api/roles/assignments`, { signal }).then(
            (r) => r.json(),
          ),
        ]);
        setData((prev) => ({
          ...prev,
          users: Array.isArray(userRes) ? userRes : userRes?.users || [],
          systemAssignments: Array.isArray(assignRes) ? assignRes : [],
        }));
      }

      // ðŸ”„ Main Endpoint Fetch
      if (endpoint) {
        const res = await fetch(`http://localhost:4000/api/${endpoint}`, {
          signal,
        }).then((r) => r.json());
        let actualData = Array.isArray(res)
          ? res
          : res.users ||
            res.courses ||
            res.roles ||
            res.learningpaths ||
            res.cohorts ||
            [];
        if (endpoint) setData((prev) => ({ ...prev, [endpoint]: actualData }));
      }

      // Fetch categories if doing courses
      if (mainTab === "courses") {
        const cats = await fetch(
          `http://localhost:4000/api/courses/categories`,
          { signal },
        ).then((r) => r.json());
        setData((prev) => ({
          ...prev,
          categories: Array.isArray(cats) ? cats : [],
        }));
      }

      // ðŸ” Global Assignments Persistence Sync
      if (mainTab === "permissions" || subTab === "Assign system roles") {
        const [usersRes, assignRes] = await Promise.all([
          fetch(`http://localhost:4000/api/users`, { signal }).then((r) =>
            r.json(),
          ),
          fetch(`http://localhost:4000/api/roles/assignments?contextid=1`, {
            signal,
          }).then((r) => r.json()),
        ]);

        setData((prev) => ({
          ...prev,
          users: Array.isArray(usersRes) ? usersRes : usersRes?.users || [],
          systemAssignments: Array.isArray(assignRes) ? assignRes : [],
        }));
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    setLoading(true);
    try {
      if (!roleForm.userid || !roleForm.roleid)
        throw new Error("Please select both a user and a role");
      const res = await fetch("http://localhost:4000/api/roles/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      }).then((r) => r.json());
      if (res && res.error) throw new Error(res.error);
      alert("Role Assigned Successfully!");
      setRoleForm({
        userid: "",
        roleid: "",
        contextlevel: "system",
        instanceid: 0,
      });
      fetchTabData(); // Refresh UI instantly
    } catch (err) {
      alert("Assignment failed: " + err.message);
    }
    setLoading(false);
  };

const handleEnrollUsers = async () => {
  const users = selectedUserIds.length ? selectedUserIds : enrolledUserIds;
  const courses = selectedCourseIds.length ? selectedCourseIds : [];
  if (!users.length) return alert('Please select at least one user to enroll.');
  if (!courses.length) return alert('Please select at least one course.');
  setLoading(true);
  try {
    // Build an explicit enrolments array matching Moodle's expected structure
    const enrolments = [];
    for (const uid of users) {
      for (const cid of courses) {
        enrolments.push({
          userid: Number(uid),
          courseid: Number(cid),
          roleid: Number(modalRole) || 5,
          timestart: 0,
          timeend: 0,
        });
      }
    }

    const res = await fetch('http://localhost:4000/api/enrolments/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrolments }),
    }).then(r => r.json());

    if (res.error) throw new Error(res.error);

    alert('Users enrolled successfully');
    setShowEnrollModal(false);
    await fetchTabData();
  } catch (err) {
    const msg = err?.message || err;
    if (String(msg).toLowerCase().includes('access control') || String(msg).toLowerCase().includes('permission')) {
      alert('Enrollment failed: Access denied by Moodle. Ensure your MOODLE_WS_TOKEN has the required capabilities (enrol/manual:enrol) and the token user has appropriate permissions in the course context.\n\nDetails: ' + msg);
    } else {
      alert('Enrollment failed: ' + msg);
    }
  } finally {
    setLoading(false);
  }
};
  const handleUnassignRole = async (userid, roleid) => {
    if (!confirm("Are you sure you want to revoke this role?")) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/roles/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userid,
          roleid,
          contextlevel: "system",
          instanceid: 0,
        }),
      }).then((r) => r.json());
      if (res && res.error) throw new Error(res.error);
      alert("Role Revoked Successfully!");
      // Refresh assignments
      fetchTabData();
    } catch (err) {
      alert("Revocation failed: " + err.message);
    }
    setLoading(false);
  };

  const handleOpenEnrollModal = () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user before enrolling.");
      return;
    }
    if (selectedUserIds.length === 1) {
      const assignment = data.systemAssignments?.find(
        (a) => parseInt(a.userid) === parseInt(selectedUserIds[0]),
      );
      if (assignment?.roleid) setModalRole(parseInt(assignment.roleid));
    }
    setShowEnrollModal(true);
  };

  const handleCreateCourseFinal = () => {
    if (!courseForm.fullname || !courseForm.categoryid) {
      alert("Please fill in course name and category.");
      return;
    }
    setCourseStep(3); // Move to Content Builder
  };

  const handlePublishCourse = async () => {
    setLoading(true);
    try {
      // 1. Create Course
      const coursePayload = {
        ...courseForm,
        shortname:
          courseForm.fullname.toLowerCase().replace(/[^a-z0-9]/g, "") +
          "-" +
          Math.floor(Math.random() * 1000),
      };
      const course = await fetch("http://localhost:4000/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coursePayload),
      }).then((r) => r.json());

      if (course.error) throw new Error(course.error);

      // 2. Add Activities
      console.log(
        `ðŸ“š Adding ${courseTopics.reduce((acc, t) => acc + t.activities.length, 0)} activities to course ${course.id}`,
      );

      for (let i = 0; i < courseTopics.length; i++) {
        const topic = courseTopics[i];
        for (const act of topic.activities) {
          console.log(`ðŸ“¡ Posting activity: ${act.name} to section ${i}`);
          const actRes = await fetch(
            `http://localhost:4000/api/courses/${course.id}/activities`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...act, section: i }),
            },
          ).then((r) => r.json());

          if (actRes.error) {
            console.error(
              `âŒ Failed to add activity ${act.name}:`,
              actRes.error,
            );
          } else {
            console.log(
              `âœ… Activity ${act.name} added successfully (ID: ${actRes.id})`,
            );

            // ðŸ“„ If it's a PDF activity with a local upload, sync it to Moodle!
            if (
              act.type === "pdf" &&
              act.pdfUrl &&
              act.pdfUrl.includes("uploads/")
            ) {
              console.log(
                `ðŸ”„ Syncing PDF for activity ${actRes.id} to Moodle...`,
              );
              await fetch(`http://localhost:4000/api/courses/sync-file`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cmid: actRes.id,
                  courseid: course.id,
                  localUrl: act.pdfUrl,
                  name: act.name,
                  type: "pdf",
                }),
              }).then((r) => r.json());
            }

            // ðŸŽ¥ If it's a Video activity with a local upload, sync it to Moodle!
            if (
              act.type === "video" &&
              act.videoUrl &&
              act.videoUrl.includes("uploads/")
            ) {
              console.log(
                `ðŸ”„ Syncing Video for activity ${actRes.id} to Moodle...`,
              );
              await fetch(`http://localhost:4000/api/courses/sync-file`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cmid: actRes.id,
                  courseid: course.id,
                  localUrl: act.videoUrl,
                  name: act.name,
                  type: "video",
                }),
              }).then((r) => r.json());
            }
          }
        }
      }

      // 3. Enroll Users
      for (const userId of enrolledUserIds) {
        const roleid = enrolledRoles[userId] || 5; // Default to student
        await fetch("http://localhost:4000/api/roles/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userid: userId,
            roleid: roleid,
            contextlevel: "course",
            instanceid: course.id,
          }),
        });
      }

      setCreatedCourse(course);
      alert("Course Published Successfully!");
      setCourseStep(1);
      setMainTab("courses");
      setSubTab("Manage courses");
      setActiveCourseView("dashboard");
    } catch (err) {
      alert("Publication failed: " + err.message);
    }
    setLoading(false);
  };

  const handleSaveActivity = () => {
    const formToUse =
      selectedActivity === "pdf" ? pdfActivityForm : videoActivityForm;
    const newActivity = {
      ...formToUse,
      id: `temp-${Date.now()}`,
      type: selectedActivity,
    };

    setCourseTopics((prev) =>
      prev.map((t) =>
        t.id === activeTopicId
          ? { ...t, activities: [...t.activities, newActivity] }
          : t,
      ),
    );

    setActiveCourseView("dashboard");
    // Reset form
    setVideoActivityForm({
      name: "",
      description: "",
      displayDescription: false,
      videoType: "upload",
      videoUrl: "",
      playerSizeWidth: "800",
      playerSizeHeight: "500",
      moveForward: false,
      responsive: true,
      posterImageUrl: "",
      captions: "",
      completionTracking: "manual",
      requireView: false,
      courseCompletion: false,
      completionDate: "",
      completionDateEnabled: false,
      restrictions: [],
    });
    setPdfActivityForm({
      name: "",
      description: "",
      displayDescription: false,
      displayContents: "separate",
      showSubfolders: true,
      openInNewTab: true,
      pdfUrl: "",
      completionTracking: "manual",
      requireView: false,
      courseCompletion: false,
      completionDate: "",
      completionDateEnabled: false,
      restrictions: [],
    });
  };

  const handleCreateCategory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/courses/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      }).then((r) => r.json());

      if (res.error) throw new Error(res.error);
      alert("Category Created Successfully!");
      setCategoryForm({ name: "", parent: "0", idnumber: "", description: "" });
      fetchTabData();
    } catch (err) {
      alert("Failed to create category: " + err.message);
    }
    setLoading(false);
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/courses/${id}`, {
        method: "DELETE",
      }).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      alert("Course Deleted Successfully!");
      fetchTabData();
    } catch (err) {
      alert("Deletion failed: " + err.message);
    }
    setLoading(false);
  };

  const handleDeletePath = async (id) => {
    if (!confirm("Are you sure you want to delete this learning path?")) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:4000/api/learningpaths/${id}`, {
        method: "DELETE",
      }).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      alert("Path Deleted Successfully!");
      fetchTabData();
    } catch (err) {
      alert("Deletion failed: " + err.message);
    }
    setLoading(false);
  };

  const fetchManageUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
        search: searchQuery,
        sortBy: userSort.field,
        sortDir: userSort.dir,
        fullName: userFilters.fullName || "",
        email: userFilters.email || "",
        username: userFilters.username || "",
        city: userFilters.city || "",
        country: userFilters.country || "",
        course: userFilters.course || "",
        systemRole: userFilters.systemRole || "",
      });
      const res = await fetch(
        `http://localhost:4000/api/users/manage?${params}`,
      ).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setUserManageStats(res.stats);
      setManageUsers(res.users || []);
      setUserPagination(
        res.pagination || {
          page: 1,
          limit: itemsPerPage,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Failed to load manage users:", err);
      alert("Failed to load users from Moodle: " + err.message);
    }
    setLoading(false);
  };

  const toggleUserSort = (field) => {
    setUserSort((prev) => ({
      field,
      dir: prev.field === field && prev.dir === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const fetchCohortsList = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/cohorts").then((r) =>
        r.json(),
      );
      if (res.error)
        throw new Error(res.hint ? `${res.error}\n\n${res.hint}` : res.error);
      setData((prev) => ({ ...prev, cohorts: Array.isArray(res) ? res : [] }));
    } catch (err) {
      console.error("Failed to fetch cohorts:", err);
      alert(
        "Could not load cohorts. " +
          (err.message || "Check that the node API is running on port 4000."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCohort = async (presetName = null) => {
    const name = presetName || cohortForm.name?.trim();
    if (!name) return alert("Please enter a cohort name");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: cohortForm.description || "",
        }),
      }).then((r) => r.json());
      if (res.error)
        throw new Error(res.hint ? `${res.error}\n\n${res.hint}` : res.error);
      const msg = res._warning
        ? `Cohort "${name}" created (local store).\n\n${res._warning}`
        : `Cohort "${name}" created successfully!`;
      alert(msg);
      setCohortForm({ name: "", description: "" });
      setShowCohortModal(false);
      await fetchCohortsList();
    } catch (err) {
      alert("Failed to create cohort: " + err.message);
    }
    setLoading(false);
  };

  const loadPathNotifications = async (pathId) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/learningpaths/${pathId}/notifications`,
      ).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setPathNotifications({ ...defaultPathNotifications(), ...res });
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const updateNotificationBlock = (key, patch) => {
    setPathNotifications((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const handleSaveNotifications = async () => {
    if (!editingPath?.id)
      return alert(
        "Save the learning path first before configuring notifications.",
      );
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:4000/api/learningpaths/${editingPath.id}/notifications`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pathNotifications),
        },
      ).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      setPathSuccess(true);
      alert("Notification templates saved successfully!");
    } catch (err) {
      alert("Failed to save notifications: " + err.message);
    }
    setLoading(false);
  };

  const handleCancelNotifications = () => {
    if (editingPath?.id) loadPathNotifications(editingPath.id);
    else setPathNotifications(defaultPathNotifications());
  };

  const handleDeleteCohorts = async () => {
    if (selectedCohortIds.length === 0) return;
    if (
      !confirm(
        `Delete ${selectedCohortIds.length} cohort(s)? This cannot be undone.`,
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/cohorts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortids: selectedCohortIds }),
      }).then((r) => r.json());
      if (res.error) throw new Error(res.error);
      alert("Cohort(s) deleted successfully!");
      setSelectedCohortIds([]);
      await fetchCohortsList();
    } catch (err) {
      alert("Failed to delete cohorts: " + err.message);
    }
    setLoading(false);
  };

  const handleCreatePath = async () => {
    if (!newPathForm.name) return alert("Please enter path name");
    setLoading(true);
    try {
      const url = editingPath
        ? `http://localhost:4000/api/learningpaths/${editingPath.id}`
        : "http://localhost:4000/api/learningpaths";
      const method = editingPath ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPathForm,
          courses: selectedPathCourses,
          cohorts: selectedPathCohorts,
        }),
      }).then((r) => r.json());

      if (res.error) throw new Error(res.error);

      setEditingPath(res);
      setPathNotifications(res.notifications || defaultPathNotifications());
      setPathSuccess(true);
      setPathStep(2);
      setPathSubTab("Overview");
      fetchTabData();
    } catch (err) {
      alert(
        `Failed to ${editingPath ? "update" : "create"} path: ` + err.message,
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!showCourseDropdown) return;
    const close = () => setShowCourseDropdown(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showCourseDropdown]);

  const handleBulkDeleteCourses = async () => {
    if (selectedCourseIds.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedCourseIds.length} courses?`,
      )
    )
      return;

    setLoading(true);
    try {
      // Delete courses sequentially or in parallel
      const deletePromises = selectedCourseIds.map((id) =>
        fetch(`http://localhost:4000/api/courses/${id}`, {
          method: "DELETE",
        }).then((r) => r.json()),
      );

      const results = await Promise.all(deletePromises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        alert(
          `Deleted with some errors: ${errors.map((e) => e.error).join(", ")}`,
        );
      } else {
        alert(`Successfully deleted ${selectedCourseIds.length} courses!`);
      }

      setSelectedCourseIds([]);
      fetchTabData();
    } catch (err) {
      alert("Bulk deletion failed: " + err.message);
    }
    setLoading(false);
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      if (showModal === "Edit Course") {
        const res = await fetch(
          `http://localhost:4000/api/courses/${editingCourse.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseForm),
          },
        ).then((r) => r.json());
        if (res.error) throw new Error(res.error);
        setShowModal(false);
        fetchTabData();
        alert("Course Updated Successfully!");
        setLoading(false);
        return;
      }
      const isEdit = showModal === "Edit User";
      const url = isEdit
        ? `http://localhost:4000/api/users/${editingUser.id}`
        : "http://localhost:4000/api/users";
      const method = isEdit ? "PUT" : "POST";
      const { cohortIds, ...userFields } = form;
      const payload = isEdit
        ? { ...userFields }
        : { ...userFields, cohortIds: cohortIds || [] };

      // Ensure suspended is sent as integer flag expected by backend
      if (typeof payload.suspended !== "undefined")
        payload.suspended = payload.suspended ? 1 : 0;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json());

      if (res.error) throw new Error(res.error);

      setShowModal(false);
      // Refresh users list specifically to reflect suspended changes immediately
      try {
        await fetchManageUsers();
      } catch (e) {
        /* ignore */
      }
      fetchTabData();
      alert(`User ${isEdit ? "Updated" : "Created"} Successfully!`);
    } catch (err) {
      alert("Operation failed: " + err.message);
    }
    setLoading(false);
  };

  const handleActivityFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:4000/api/system/upload", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());
      if (res.url) {
        if (selectedActivity === "pdf") {
          setPdfActivityForm((prev) => ({ ...prev, [field]: res.url }));
        } else {
          setVideoActivityForm((prev) => ({ ...prev, [field]: res.url }));
        }
        alert("File uploaded successfully!");
      }
    } catch (err) {
      alert("Upload failed");
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:4000/api/system/upload", {
        method: "POST",
        body: formData,
      }).then((r) => r.json());

      if (res.url) {
        setForm({ ...form, profileimageurl: res.url });
        alert("Image uploaded successfully!");
      }
    } catch (err) {
      alert("Upload failed");
    }
    setLoading(false);
  };

  const menuItems = {
    dashboard: {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      subs: ["Overview"],
    },
    users: {
      label: "User Management",
      icon: <Users size={18} />,
      subs: ["Manage users", "Add user"],
    },
    courses: {
      label: "Course Library",
      icon: <BookOpen size={18} />,
      subs: ["Manage courses", "Categories", "Add course"],
    },
    permissions: {
      label: "System Roles",
      icon: <ShieldCheck size={18} />,
      subs: ["Define roles", "Assign system roles"],
    },
    learningPaths: {
      label: "Learning Paths",
      icon: <MapPin size={18} />,
      subs: ["Learning Paths", "Add Path"],
    },
    cohorts: {
      label: "Cohort Groups",
      icon: <Layers size={18} />,
      subs: ["Manage cohorts"],
    },
  };

  const formatCohortDate = (cohort) => {
    const ts =
      cohort?.timecreated ?? cohort?.enrollmentDate ?? cohort?.timemodified;
    if (ts == null || ts === "") return "—";
    const n = Number(ts);
    const ms = n < 1e12 ? n * 1000 : n;
    if (!Number.isFinite(ms)) return "—";
    return new Date(ms).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openAddUserModal = () => {
    setForm({
      username: "",
      auth: "manual",
      suspended: false,
      generatepass: false,
      password: "",
      forcechange: false,
      firstname: "",
      lastname: "",
      email: "",
      visibility: "1",
      city: "",
      country: "IN",
      timezone: "99",
      lang: "en",
      description: "",
      idnumber: "",
      institution: "",
      department: "",
      phone1: "",
      phone2: "",
      address: "",
      profileimageurl: "",
      roleid: "",
      cohortIds: [],
    });
    setModalSection("general");
    if (!data.roles.length) {
      fetch("http://localhost:4000/api/roles")
        .then((r) => r.json())
        .then((res) => {
          setData((prev) => ({
            ...prev,
            roles: Array.isArray(res) ? res : res.roles || [],
          }));
        });
    }
    fetchCohortsList();
    setShowModal("Add User");
  };

  const toggleFormCohort = (cohortId) => {
    setForm((prev) => {
      const ids = prev.cohortIds || [];
      const next = ids.includes(cohortId)
        ? ids.filter((id) => id !== cohortId)
        : [...ids, cohortId];
      return { ...prev, cohortIds: next };
    });
  };

  const filteredCohorts = (data.cohorts || []).filter((c) => {
    if (!cohortSearchQuery) return true;
    const q = cohortSearchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) || c.idnumber?.toLowerCase().includes(q)
    );
  });

  const applyUserFilters = () => {
    setUserFilters({ ...tempUserFilters });
    setCurrentPage(1);
    setShowUserFilter(false);
    fetchManageUsers();
  };

  const clearAllUserFilters = () => {
    const empty = {
      fullName: "",
      email: "",
      username: "",
      city: "",
      country: "",
      course: "",
      systemRole: "",
    };
    setTempUserFilters(empty);
    setUserFilters(empty);
    setCurrentPage(1);
    setShowUserFilter(false);
    fetchManageUsers();
  };

  const filteredManageUsers = manageUsers
    .filter((u) => u.id !== session?.user?.id && u.role !== "admin")
    .filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        u.firstname?.toLowerCase().includes(q) ||
        u.lastname?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.username?.toLowerCase().includes(q);

      const courseText = [
        Array.isArray(u.courses) ? u.courses.join(" ") : "",
        u.course || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchFilters =
        (!userFilters.fullName ||
          `${u.firstname} ${u.lastname}`
            .toLowerCase()
            .includes(userFilters.fullName.toLowerCase())) &&
        (!userFilters.email ||
          u.email?.toLowerCase().includes(userFilters.email.toLowerCase())) &&
        (!userFilters.username ||
          u.username
            ?.toLowerCase()
            .includes(userFilters.username.toLowerCase())) &&
        (!userFilters.city ||
          u.city?.toLowerCase().includes(userFilters.city.toLowerCase())) &&
        (!userFilters.country ||
          u.country
            ?.toLowerCase()
            .includes(userFilters.country.toLowerCase())) &&
        (!userFilters.course ||
          courseText.includes(userFilters.course.toLowerCase())) &&
        (!userFilters.systemRole ||
          u.role?.toLowerCase().includes(userFilters.systemRole.toLowerCase()));

      return matchSearch && matchFilters;
    });

  return (
    <div className="w-full h-[calc(100vh-80px)] flex overflow-hidden bg-background text-main">
      {/* MASTER SIDEBAR */}
      <div className="w-64 flex-shrink-0 bg-surface border-r border-glass-border flex flex-col shadow-sm">
        <div className="p-5 border-b border-glass-border">
          <h1 className="text-lg font-black not-italic uppercase tracking-tighter">
            Admin
            {/* <br /> */}
            <span className="text-primary not-italic"> Panel</span>
          </h1>
        </div>
        <nav className="flex-grow p-3 space-y-1">
          {Object.entries(menuItems).map(([key, item]) => (
            <div key={key}>
              <button
                onClick={() => {
                  setMainTab(key);
                  setSubTab(item.subs[0]);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black uppercase text-[10px] tracking-widest ${mainTab === key ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:bg-surface-hover"}`}
              >
                {item.icon} {item.label}
              </button>
              {mainTab === key && (
                <div className="ml-8 mt-1 space-y-0.5 py-1 border-l-2 border-primary/20 animate-in slide-in-from-left-1 duration-300">
                  {item.subs.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSubTab(sub);
                        if (sub === "Add user") openAddUserModal();
                      }}
                      className={`w-full text-left px-5 py-2 text-[10px] font-bold tracking-tight transition-all ${subTab === sub ? "text-primary" : "text-muted hover:text-main"}`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-grow flex flex-col min-w-0">
        {/* <div className="h-16 bg-surface/80 border-b border-glass-border px-5 sm:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-black italic tracking-tight uppercase text-main/90">
            {subTab}
          </h2>
          {loading && (
            <Loader2 className="animate-spin text-primary" size={18} />
          )}
        </div> */}

        <div className="flex-grow overflow-y-auto p-5 sm:p-6 custom-scrollbar">
          {mainTab === "dashboard" && subTab === "Overview" && (
            <div className="space-y-5 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
              {/* TOP STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<Users size={20} />}
                  label="Total Users"
                  value={data.users.length}
                  sub="Active Now"
                />
                <StatCard
                  icon={<Activity size={20} />}
                  label="Active Users"
                  value={
                    data.users.filter(
                      (u) => u.lastaccess > Date.now() / 1000 - 86400,
                    ).length
                  }
                  sub="Past 24h"
                />
                <StatCard
                  icon={<MapPin size={20} />}
                  label="Learning Paths"
                  value={data.learningpaths?.length || 0}
                  sub="Active Paths"
                />
                <StatCard
                  icon={<BookOpen size={20} />}
                  label="Total Courses"
                  value={data.courses.length}
                  sub="Published"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* GENERAL OVERVIEW - PIE CHARTS */}
                <div className="lg:col-span-2 academy-card p-5 sm:p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-main">
                      General Overview
                    </h3>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/5 rounded-lg border border-glass-border">
                        <TrendingUp size={14} className="text-primary" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">
                        User Distribution Overview
                      </p>
                      <div className="flex items-center gap-4">
                        {(() => {
                          const total = data.users.length || 1;
                          const active = data.users.filter(
                            (u) => u.lastaccess > Date.now() / 1000 - 86400,
                          ).length;
                          const suspended = data.users.filter(
                            (u) => u.suspended,
                          ).length;
                          const inactive = total - active - suspended;

                          const activeP = (active / total) * 100;
                          const inactiveP = (inactive / total) * 100;
                          const suspendedP = (suspended / total) * 100;

                          return (
                            <div
                              className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
                              style={{
                                background: `conic-gradient(#22c55e 0% ${activeP}%, #64748b ${activeP}% ${activeP + inactiveP}%, #ef4444 ${activeP + inactiveP}% 100%)`,
                              }}
                            >
                              <div className="absolute inset-5 bg-surface rounded-full flex flex-col items-center justify-center border border-glass-border shadow-inner px-2">
                                <span className="text-lg font-black text-main leading-none">
                                  {active}
                                </span>
                                <span className="text-[7px] font-bold text-muted uppercase mt-0.5">
                                  Active
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        <div className="space-y-2">
                          <LegendItem
                            color="#0ea5e9"
                            label="Total Users"
                            value={data.users.length}
                          />
                          <LegendItem
                            color="#22c55e"
                            label="Active"
                            value={
                              data.users.filter(
                                (u) => u.lastaccess > Date.now() / 1000 - 86400,
                              ).length
                            }
                          />
                          <LegendItem
                            color="#64748b"
                            label="Inactive"
                            value={
                              data.users.length -
                              data.users.filter(
                                (u) => u.lastaccess > Date.now() / 1000 - 86400,
                              ).length
                            }
                          />
                          <LegendItem
                            color="#ef4444"
                            label="Suspended"
                            value={data.users.filter((u) => u.suspended).length}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase text-muted tracking-widest">
                        User Enrollments Breakdown
                      </p>
                      <div className="flex items-center gap-4">
                        {(() => {
                          const total = data.users.length || 1;
                          const enrolled = Math.floor(total * 0.8); // Mocking enrollment ratio as I don't have enrollment endpoint yet
                          const overdue = 13;
                          const notEnrolled = total - enrolled - overdue;

                          const enrolledP = (enrolled / total) * 100;
                          const overdueP = (overdue / total) * 100;

                          return (
                            <div
                              className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl flex-shrink-0"
                              style={{
                                background: `conic-gradient(#0ea5e9 0% ${enrolledP}%, #f59e0b ${enrolledP}% ${enrolledP + overdueP}%, #64748b ${enrolledP + overdueP}% 100%)`,
                              }}
                            >
                              <div className="absolute inset-5 bg-surface rounded-full flex flex-col items-center justify-center border border-glass-border shadow-inner px-2">
                                <span className="text-lg font-black text-main leading-none">
                                  {enrolled}
                                </span>
                                <span className="text-[7px] font-bold text-muted uppercase mt-0.5">
                                  Enrolled
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                        <div className="space-y-2">
                          <LegendItem
                            color="#0ea5e9"
                            label="Total Courses"
                            value={data.courses.length}
                          />
                          <LegendItem
                            color="#22c55e"
                            label="Enrolled"
                            value={Math.floor(data.users.length * 0.8)}
                          />
                          <LegendItem
                            color="#ef4444"
                            label="Not Enrolled"
                            value={Math.ceil(data.users.length * 0.2)}
                          />
                          <LegendItem
                            color="#f59e0b"
                            label="Overdue"
                            value={13}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CALENDAR SECTION */}
                <div className="academy-card p-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-main">
                      April 2026
                    </h3>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <ChevronLeft size={16} />
                      </button>
                      <button className="p-2 hover:bg-white/5 rounded-lg transition-all">
                        <ChevronRight size={16} />
                      </button>
                      <button className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 ml-2">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-3 text-center">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (d) => (
                        <span
                          key={d}
                          className="text-[9px] font-black uppercase text-muted tracking-widest"
                        >
                          {d}
                        </span>
                      ),
                    )}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === new Date().getDate();
                      const dayEvents = data.events.filter(
                        (e) => e.day === day && e.month === 3,
                      ); // April is index 3
                      const hasEvents = dayEvents.length > 0;

                      return (
                        <div
                          key={i}
                          className="relative group flex justify-center"
                          onMouseEnter={() =>
                            hasEvents && setSelectedEventDay(day)
                          }
                          onMouseLeave={() => setSelectedEventDay(null)}
                        >
                          <button
                            className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all relative z-10 ${isToday ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-main hover:bg-white/5"}`}
                            onClick={() => {
                              setSubTab("Events Calendar");
                              setSelectedEventDay(null);
                            }}
                          >
                            {day}
                            {hasEvents && !isToday && (
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                            )}
                          </button>
                          {selectedEventDay === day && (
                            <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-background border border-glass-border shadow-2xl rounded-2xl z-[100] p-5 animate-in slide-in-from-bottom-2 duration-300">
                              <div className="flex justify-between items-center mb-4 border-b border-glass-border pb-2">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                    Your Events !
                                  </span>
                                  <span className="text-[9px] font-bold text-muted">
                                    {day} April 2026
                                  </span>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between text-[8px] font-black uppercase text-muted border-b border-white/5 pb-2">
                                  <span>Timing</span>
                                  <span>Name</span>
                                  <span>Location</span>
                                </div>
                                {dayEvents.map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="flex items-center justify-between group/ev"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                      <span className="text-[9px] font-bold text-main">
                                        {ev.time}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase truncate max-w-[80px]">
                                      {ev.title}
                                    </span>
                                    <span className="text-[8px] font-black uppercase text-primary/80">
                                      {ev.location}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* LEARNING HOURS CHART (FULL WIDTH) */}
              <div className="academy-card p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-main tracking-tight">
                      Learning Hours
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-sky-500/15 text-sky-600 border border-sky-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        Total Hours: 75.29
                      </span>
                      <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight">
                        Avg Hours: 15.06
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-surface/60 border border-glass-border px-3 py-2 rounded-xl">
                      <span className="text-[10px] font-black text-main uppercase">
                        This Week
                      </span>
                      <ChevronDown size={14} className="text-muted" />
                    </div>
                    <button
                      type="button"
                      className="p-2 bg-surface border border-glass-border rounded-xl hover:bg-primary/10 transition-all group"
                    >
                      <Sliders
                        size={16}
                        className="text-muted group-hover:text-primary transition-colors"
                      />
                    </button>
                  </div>
                </div>

                <div className="relative h-[240px] w-full pl-12 pr-2">
                  <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] font-bold text-muted/70 w-10 text-right">
                    {[40, 35, 30, 25, 20, 15, 10, 5, 0].map((v) => (
                      <span key={v}>{v}.0hrs</span>
                    ))}
                  </div>
                  <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none opacity-[0.12]">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-full border-t border-dashed border-muted"
                      />
                    ))}
                  </div>
                  <div className="absolute left-12 right-0 bottom-8 h-px bg-glass-border" />
                  <div className="absolute left-12 right-0 top-0 bottom-8 flex items-end justify-around gap-2">
                    {[
                      { label: "Mar 26", value: 14.5, active: false },
                      { label: "Apr 02", value: 20.8, active: false },
                      { label: "Apr 09", value: 39.2, active: true },
                      { label: "Apr 16", value: 0, active: false },
                      { label: "Apr 23", value: 1.5, active: false },
                    ].map((bar, i) => (
                      <div
                        key={i}
                        className="relative flex flex-col items-center justify-end flex-1 max-w-[72px] h-full pb-5 group"
                      >
                        <div className="relative w-full flex flex-col justify-end flex-1 min-h-0 w-full max-w-[48px]">
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ${bar.active ? "bg-sky-400 shadow-md shadow-sky-500/25" : "bg-sky-400/45 hover:bg-sky-400/70"}`}
                            style={{
                              height: `${Math.max((bar.value / 40) * 100, bar.value > 0 ? 4 : 0)}%`,
                            }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-glass-border px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap z-10">
                              <span className="text-[9px] font-black text-primary">
                                {bar.value} hrs
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wide absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* COURSES OVERVIEW */}
                <div className="academy-card p-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-main">
                      Courses Overview & Enrollment
                    </h3>
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/5 rounded-lg border border-glass-border">
                        <Filter size={14} className="text-muted" />
                      </button>
                      <button className="p-2 bg-white/5 rounded-lg border border-glass-border">
                        <LayoutGrid size={14} className="text-muted" />
                      </button>
                      <button className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                        <TrendingUp size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-6 mb-3 border-b border-glass-border pb-3">
                    <StatItem
                      label="Total Course"
                      value={data.courses.length}
                    />
                    <StatItem
                      label="With Enrollments"
                      value={data.courses.filter((c) => c.visible).length}
                      color="text-primary"
                    />
                    <StatItem
                      label="Without Enrollments"
                      value={data.courses.filter((c) => !c.visible).length}
                      color="text-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 text-[8px] font-black uppercase text-muted tracking-widest px-4 border-b border-glass-border pb-3">
                      <div className="col-span-2">Top Performing Course</div>
                      <div>Views</div>
                      <div>Enrolled</div>
                      <div>Status</div>
                    </div>
                    {data.courses
                      .slice(
                        (dashboardPage - 1) * coursesPerPage,
                        dashboardPage * coursesPerPage,
                      )
                      .map((course) => (
                        <TopCourseRow
                          key={course.id}
                          name={course.fullname}
                          views={Math.floor(Math.random() * 5000)}
                          enrolled={Math.floor(Math.random() * 200)}
                          status={course.visible ? "Success" : "Active"}
                        />
                      ))}
                    {data.courses.length === 0 && (
                      <p className="text-[10px] text-center p-4 text-muted font-black uppercase">
                        No courses found
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center items-center gap-3 mt-4 pt-4 border-t border-glass-border">
                    <button
                      disabled={dashboardPage === 1}
                      onClick={() =>
                        setDashboardPage((prev) => Math.max(1, prev - 1))
                      }
                      className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all disabled:opacity-30"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                      <span className="text-primary">{dashboardPage}</span> /{" "}
                      {Math.ceil(data.courses.length / coursesPerPage) || 1}
                    </div>
                    <button
                      disabled={
                        dashboardPage >=
                        Math.ceil(data.courses.length / coursesPerPage)
                      }
                      onClick={() => setDashboardPage((prev) => prev + 1)}
                      className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all disabled:opacity-30"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* LATEST ANNOUNCEMENTS */}
                <div className="academy-card p-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-main">
                      Latest Announcements
                    </h3>
                    <button
                      type="button"
                      className="p-2 bg-primary text-white rounded-lg shadow-md shadow-primary/20 hover:scale-105 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {data.announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-glass-border hover:border-primary/30 transition-all group gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                            <Bell size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-black text-main uppercase tracking-tight line-clamp-1">
                              {ann.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[9px] font-bold text-muted uppercase flex items-center gap-1">
                                <Users size={10} /> {ann.author}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[9px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10 flex items-center gap-1.5">
                            <Clock size={10} />{" "}
                            {new Date(ann.date).toLocaleString("en-US", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </span>
                          <button className="p-2 text-muted hover:text-main transition-colors">
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center items-center gap-3 mt-4 pt-4 border-t border-glass-border">
                    <button
                      type="button"
                      className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                      <span className="text-primary">1</span> / 4
                    </div>
                    <button
                      type="button"
                      className="p-2 hover:bg-white/5 rounded-xl border border-glass-border transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* {subTab === 'Events Calendar' && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     <div className="academy-card p-10 min-h-[600px] flex flex-col items-center justify-center text-center">
                        <Calendar size={64} className="text-primary/20 mb-8" />
                        <h2 className="text-2xl font-black text-main uppercase italic mb-4">Advanced Events Calendar</h2>
                        <p className="text-muted text-sm max-w-lg mb-10 leading-relaxed font-medium italic">You are entering the master scheduling engine. Here you can manage all global syncs, course webinars, and student milestones.</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Total Events" value={data.events.length} />
                           </div>
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Upcoming" value={2} color="text-primary" />
                           </div>
                           <div className="p-8 bg-white/5 border border-glass-border rounded-[32px] space-y-4">
                              <StatItem label="Completed" value={1} color="text-muted" />
                           </div>
                        </div>
                        <button className="mt-12 bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20">Create New Event</button>
                     </div>
                  </div>
               )} */}

          {subTab === "Manage users" && (
            <div className="space-y-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-main tracking-tight">
                    Manage Users
                  </h3>
                  <Info size={16} className="text-muted/60" />
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glass-border bg-surface text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-all">
                  <Settings size={14} /> Users Settings
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <ManageUserStatCard
                  label="Total Users"
                  value={userManageStats?.totalUsers ?? "—"}
                  icon={<Users size={22} />}
                  tone="blue"
                />
                <ManageUserStatCard
                  label="Total Enrolments"
                  value={userManageStats?.totalEnrolments ?? "—"}
                  icon={<GraduationCap size={22} />}
                  tone="purple"
                />
                <ManageUserStatCard
                  label="Inactive Users"
                  value={userManageStats?.inactiveUsers ?? "—"}
                  icon={<UserX size={22} />}
                  tone="orange"
                />
                <ManageUserStatCard
                  label="Active Users"
                  value={userManageStats?.activeUsers ?? "—"}
                  icon={<UserCheck size={22} />}
                  tone="green"
                />
                <ManageUserStatCard
                  label="New Users (This Month)"
                  value={
                    userManageStats?.newUsersThisMonth != null
                      ? `+${userManageStats.newUsersThisMonth}`
                      : "—"
                  }
                  icon={<UserPlus size={22} />}
                  tone="amber"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-surface/50 p-3 rounded-xl border border-glass-border">
                <div className="relative flex-grow min-w-[200px] max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full h-11 bg-background/50 border border-glass-border rounded-xl pl-11 pr-4 text-xs font-bold focus:border-primary outline-none"
                    placeholder="Search by name, email, username, city, country or role"
                  />
                </div>
                <button
                  onClick={() => {
                    setTempUserFilters(userFilters);
                    setShowUserFilter(true);
                  }}
                  className="relative p-3 rounded-xl border border-glass-border bg-surface text-muted hover:text-primary transition-all"
                >
                  <SlidersHorizontal size={16} />
                  {Object.values(userFilters).some(Boolean) && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black">
                      {Object.values(userFilters).filter(Boolean).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={openAddUserModal}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> New User
                </button>
                <button className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2">
                  <Upload size={14} /> Bulk Upload
                </button>
                <button
                  type="button"
                  onClick={handleOpenEnrollModal}
                  className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-glass-border text-primary bg-primary/5 hover:bg-primary/10 transition-all flex items-center gap-2"
                >
                  Enroll Users
                </button>
                {/* <button className="p-3 rounded-xl border border-glass-border bg-surface text-muted hover:text-primary transition-all">
                           <MoreVertical size={16} />
                        </button> */}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(userFilters)
                    .filter(([, value]) => value)
                    .map(([key, value]) => {
                      const label =
                        {
                          fullName: "Full Name",
                          email: "Email",
                          username: "Username",
                          city: "City/Town",
                          country: "Country",
                          course: "Course",
                          systemRole: "System Role",
                        }[key] || key;
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-background/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted"
                        >
                          <span>{label}:</span>
                          <strong className="text-main">{value}</strong>
                        </span>
                      );
                    })}
                  {Object.values(userFilters).some(Boolean) && (
                    <button
                      onClick={clearAllUserFilters}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/20 transition-all"
                    >
                      <X size={12} /> Clear filters
                    </button>
                  )}
                </div>
                <p className="text-sm font-bold text-main">
                  Total Record Found:{" "}
                  <span className="text-primary">
                    {userPagination.total ?? 0}
                  </span>
                </p>
              </div>

              <div className="academy-card overflow-hidden rounded-[20px] border border-glass-border">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-surface/80 border-b border-glass-border uppercase text-[9px] font-black tracking-widest text-muted">
                      <th className="p-4 w-12">
                        <input
                          type="checkbox"
                          checked={
                            filteredManageUsers.length > 0 &&
                            selectedUserIds.length ===
                              filteredManageUsers.length
                          }
                          onChange={() => {
                            if (
                              selectedUserIds.length ===
                              filteredManageUsers.length
                            )
                              setSelectedUserIds([]);
                            else
                              setSelectedUserIds(
                                filteredManageUsers.map((u) => u.id),
                              );
                          }}
                          className="w-4 h-4 accent-primary"
                        />
                      </th>
                      <th className="p-4">
                        <button
                          onClick={() => toggleUserSort("firstname")}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          First Name{" "}
                          <ChevronUp
                            size={12}
                            className={
                              userSort.field === "firstname"
                                ? "opacity-100"
                                : "opacity-30"
                            }
                          />
                        </button>
                      </th>
                      <th className="p-4">
                        <button
                          onClick={() => toggleUserSort("lastname")}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          Last Name{" "}
                          <ChevronUp
                            size={12}
                            className={
                              userSort.field === "lastname"
                                ? "opacity-100"
                                : "opacity-30"
                            }
                          />
                        </button>
                      </th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Course Enrolled</th>
                      <th className="p-4">Course Completed</th>
                      <th className="p-4">
                        <button
                          onClick={() => toggleUserSort("lastaccess")}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          Last Access{" "}
                          <ChevronUp
                            size={12}
                            className={
                              userSort.field === "lastaccess"
                                ? "opacity-100"
                                : "opacity-30"
                            }
                          />
                        </button>
                      </th>
                      <th className="p-4">Status</th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border">
                    {filteredManageUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-primary/5 transition-colors text-xs font-bold"
                      >
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={() => {
                              if (selectedUserIds.includes(u.id))
                                setSelectedUserIds(
                                  selectedUserIds.filter((id) => id !== u.id),
                                );
                              else
                                setSelectedUserIds([...selectedUserIds, u.id]);
                            }}
                            className="w-4 h-4 accent-primary"
                          />
                        </td>
                        <td className="p-4 text-main">{u.firstname}</td>
                        <td className="p-4 text-main">{u.lastname}</td>
                        <td className="p-4 text-muted font-medium normal-case">
                          {u.email}
                        </td>
                        <td className="p-4">
                          <button className="text-primary font-black hover:underline">
                            {u.coursesEnrolled ?? 0}
                          </button>
                        </td>
                        <td className="p-4">
                          <span className="text-emerald-600 font-black">
                            {u.coursesCompleted ?? 0}
                          </span>
                        </td>
                        <td className="p-4 text-muted font-medium">
                          {formatLastAccessDisplay(u.lastaccess)}
                        </td>
                        <td className="p-4">
                          {(() => {
                            const isSuspended = !!(
                              u.suspended === true ||
                              u.suspended === 1 ||
                              u.suspended === "1"
                            );
                            if (!isSuspended) {
                              return (
                                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                                  <Check size={16} />
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                                <Minus size={16} />
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right relative">
                          <button
                            onClick={() =>
                              setActiveMenu(activeMenu === u.id ? null : u.id)
                            }
                            className="p-2 hover:bg-surface rounded-lg transition-all"
                          >
                            <MoreVertical size={16} className="text-muted" />
                          </button>
                          {activeMenu === u.id && (
                            <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50 bg-background border border-glass-border shadow-2xl rounded-2xl w-44 overflow-hidden">
                              <button
                                onClick={() => {
                                  setShowModal("Edit User");
                                  setEditingUser(u);
                                  setForm((prev) => ({
                                    ...prev,
                                    ...u,
                                    suspended: !!(
                                      u.suspended === true ||
                                      u.suspended === 1 ||
                                      u.suspended === "1"
                                    ),
                                    fullname:
                                      `${u.firstname} ${u.lastname}`.trim(),
                                  }));
                                  setActiveMenu(null);
                                }}
                                className="w-full px-5 py-3 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest hover:bg-primary text-left text-muted hover:text-white"
                              >
                                <Edit2 size={14} /> Edit profile
                              </button>
                              <button
                                onClick={() => {
                                  setMainTab("permissions");
                                  setSubTab("Assign system roles");
                                  setRoleForm({ ...roleForm, userid: u.id });
                                  setActiveMenu(null);
                                }}
                                className="w-full px-5 py-3 flex items-center gap-3 text-[9px] font-black uppercase tracking-widest hover:bg-primary text-left text-muted hover:text-white"
                              >
                                <ShieldCheck size={14} /> Manage Role
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredManageUsers.length === 0 && !loading && (
                      <tr>
                        <td
                          colSpan={9}
                          className="p-16 text-center text-muted text-[10px] font-black uppercase tracking-widest"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-1 py-1">
                <div className="flex items-center gap-3 bg-surface/40 px-4 py-2 rounded-xl border border-glass-border">
                  <span className="text-[10px] font-black uppercase text-muted tracking-widest">
                    Show
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-[10px] font-black uppercase text-primary outline-none cursor-pointer"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v} className="bg-surface">
                        {v}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] font-black uppercase text-muted tracking-widest">
                    per page
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-glass-border text-muted hover:text-primary disabled:opacity-30"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from(
                    { length: Math.min(5, userPagination.totalPages || 1) },
                    (_, i) => {
                      const totalP = userPagination.totalPages || 1;
                      let pageNum;
                      if (totalP <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalP - 2)
                        pageNum = totalP - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 rounded-lg text-[10px] font-black ${currentPage === pageNum ? "bg-primary text-white" : "text-muted hover:bg-surface border border-glass-border"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                  <button
                    disabled={currentPage >= (userPagination.totalPages || 1)}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(userPagination.totalPages || 1, p + 1),
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-glass-border text-muted hover:text-primary disabled:opacity-30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <p className="text-[10px] font-black uppercase text-muted tracking-widest">
                  Showing{" "}
                  {userPagination.total
                    ? (userPagination.page - 1) * userPagination.limit + 1
                    : 0}
                  –
                  {Math.min(
                    userPagination.page * userPagination.limit,
                    userPagination.total,
                  )}{" "}
                  of {userPagination.total}
                </p>
              </div>
            </div>
          )}

          {showUserFilter && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
              <div className="bg-surface border border-glass-border rounded-[24px] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-in scale-in duration-300">
                <div className="p-6 border-b border-glass-border bg-surface/50 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-lg font-black text-main uppercase tracking-tight">
                    Filter
                  </h2>
                  <button
                    onClick={() => clearAllUserFilters()}
                    className="flex items-center gap-2 text-primary text-[11px] font-black hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <X size={14} /> Clear All
                  </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-4 max-h-[calc(85vh-180px)]">
                  <div className="rounded-[28px] border border-glass-border bg-background/70 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted">
                          Personal
                        </h3>
                        <p className="text-[10px] text-muted">
                          Search by name, email and login information.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          label: "Full Name",
                          key: "fullName",
                          icon: <Users size={18} />,
                        },
                        {
                          label: "Email Address",
                          key: "email",
                          icon: <Mail size={18} />,
                        },
                        {
                          label: "Username",
                          key: "username",
                          icon: <Users size={18} />,
                        },
                      ].map((filter) => (
                        <div key={filter.key} className="space-y-2">
                          <div className="flex items-center gap-3 text-sm font-black text-main">
                            <span className="text-primary">{filter.icon}</span>
                            <span>{filter.label}</span>
                          </div>
                          <input
                            type="text"
                            value={tempUserFilters[filter.key]}
                            onChange={(e) =>
                              setTempUserFilters((prev) => ({
                                ...prev,
                                [filter.key]: e.target.value,
                              }))
                            }
                            placeholder={`Search ${filter.label.toLowerCase()}...`}
                            className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-2xl text-xs focus:border-primary outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-glass-border bg-background/70 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted">
                          Location
                        </h3>
                        <p className="text-[10px] text-muted">
                          Filter users by city or country.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          label: "City/Town",
                          key: "city",
                          icon: <MapPin size={18} />,
                        },
                        {
                          label: "Country",
                          key: "country",
                          icon: <Globe size={18} />,
                        },
                      ].map((filter) => (
                        <div key={filter.key} className="space-y-2">
                          <div className="flex items-center gap-3 text-sm font-black text-main">
                            <span className="text-primary">{filter.icon}</span>
                            <span>{filter.label}</span>
                          </div>
                          <input
                            type="text"
                            value={tempUserFilters[filter.key]}
                            onChange={(e) =>
                              setTempUserFilters((prev) => ({
                                ...prev,
                                [filter.key]: e.target.value,
                              }))
                            }
                            placeholder={`Search ${filter.label.toLowerCase()}...`}
                            className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-2xl text-xs focus:border-primary outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-glass-border bg-background/70 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted">
                          Enrollment
                        </h3>
                        <p className="text-[10px] text-muted">
                          Filter users by course or role.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        {
                          label: "Course",
                          key: "course",
                          icon: <BookOpen size={18} />,
                        },
                        {
                          label: "System Role",
                          key: "systemRole",
                          icon: <ShieldCheck size={18} />,
                        },
                      ].map((filter) => (
                        <div key={filter.key} className="space-y-2">
                          <div className="flex items-center gap-3 text-sm font-black text-main">
                            <span className="text-primary">{filter.icon}</span>
                            <span>{filter.label}</span>
                          </div>
                          <input
                            type="text"
                            value={tempUserFilters[filter.key]}
                            onChange={(e) =>
                              setTempUserFilters((prev) => ({
                                ...prev,
                                [filter.key]: e.target.value,
                              }))
                            }
                            placeholder={`Search ${filter.label.toLowerCase()}...`}
                            className="w-full px-4 py-3 bg-background/50 border border-glass-border rounded-2xl text-xs focus:border-primary outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-glass-border p-4 bg-surface/50 flex gap-3 sticky bottom-0 z-10">
                  <button
                    onClick={() => setShowUserFilter(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyUserFilters}
                    className="flex-1 px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>
          )}

          {subTab === "Learning Paths" && (
            <div className="space-y-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
              <div className="flex flex-wrap justify-between items-center gap-3 bg-surface/60 p-4 rounded-xl border border-glass-border shadow-sm">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-main">
                    Learning Paths
                  </h3>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                    Design and manage custom learning journeys for students
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSubTab("Add Path");
                    setPathStep(1);
                    setEditingPath(null);
                    setNewPathForm({
                      name: "",
                      description: "",
                      credits: "0",
                      startDate: "",
                      endDate: "",
                      enableStart: false,
                      enableEnd: false,
                      selfEnrollment: false,
                      location: "",
                      instructor: "",
                      image: null,
                      certificate: null,
                    });
                    setSelectedPathCourses([]);
                  }}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
                >
                  <Plus size={16} /> Create New Path
                </button>
              </div>

              <div className="academy-card overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                      <th className="p-4">Path Identity</th>
                      <th className="p-4">Curriculum</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border text-xs font-bold">
                    {data.learningpaths?.map((lp) => (
                      <tr
                        key={lp.id}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                              <MapPin size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-main uppercase tracking-tighter text-sm">
                                {lp.name}
                              </span>
                              <span className="text-muted text-[10px] font-medium line-clamp-1 max-w-xs">
                                {lp.description || "No description provided"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-surface border border-glass-border rounded-full text-[9px] uppercase text-primary font-black">
                              {lp.courses?.length || 0} Courses
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-muted font-medium uppercase tracking-widest text-[9px]">
                          {lp.createdAt
                            ? new Date(lp.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingPath(lp);
                                setNewPathForm({
                                  name: lp.name,
                                  description: lp.description,
                                });
                                setSelectedPathCourses(lp.courses || []);
                                setSelectedPathCohorts(lp.cohorts || []);
                                setPathNotifications(
                                  lp.notifications ||
                                    defaultPathNotifications(),
                                );
                                setSubTab("Add Path");
                                setPathStep(2);
                              }}
                              className="p-2 hover:bg-primary hover:text-white rounded-lg transition-all border border-glass-border text-muted"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletePath(lp.id)}
                              className="p-2 hover:bg-red-500 hover:text-white rounded-lg transition-all border border-glass-border text-muted"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!data.learningpaths ||
                      data.learningpaths.length === 0) && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-12 text-center text-muted uppercase text-[10px] tracking-[0.3em]"
                        >
                          No learning paths found in database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {subTab === "Add Path" && (
            <div className="space-y-4 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
              <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 pb-8">
                {/* Step Progress Bar */}
                <div className="flex items-center justify-between px-2 sm:px-4">
                  {[1, 2, 3].map((step) => (
                    <Fragment key={step}>
                      <div className="flex flex-col items-center gap-2 relative z-10">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base transition-all duration-500 ${pathStep >= step ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-surface border border-glass-border text-muted"}`}
                        >
                          {pathStep > step ? <Check size={24} /> : step}
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase tracking-widest ${pathStep >= step ? "text-primary" : "text-muted"}`}
                        >
                          {step === 1
                            ? "Details"
                            : step === 2
                              ? "Courses"
                              : "Review"}
                        </span>
                      </div>
                      {step < 3 && (
                        <div
                          className={`flex-grow h-1 mx-4 rounded-full transition-all duration-700 ${pathStep > step ? "bg-primary" : "bg-glass-border"}`}
                        />
                      )}
                    </Fragment>
                  ))}
                </div>

                {pathStep === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Header with Back Arrow */}
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => setSubTab("Learning Paths")}
                        className="p-2 rounded-full bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all border border-glass-border shadow-sm"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <h2 className="text-xl font-black text-main tracking-tight italic uppercase">
                        Create A Learning Path
                      </h2>
                    </div>

                    <div className="bg-surface border border-glass-border rounded-2xl p-5 sm:p-6 shadow-lg space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Learning Path Name
                            </label>
                            <AlertCircle size={14} className="text-red-500" />
                            <Info size={14} className="text-muted/40" />
                          </div>
                          <input
                            type="text"
                            value={newPathForm.name}
                            onChange={(e) =>
                              setNewPathForm({
                                ...newPathForm,
                                name: e.target.value,
                              })
                            }
                            className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none"
                            placeholder="Enter path name..."
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Credits
                            </label>
                            <Info size={14} className="text-muted/40" />
                          </div>
                          <input
                            type="number"
                            value={newPathForm.credits}
                            onChange={(e) =>
                              setNewPathForm({
                                ...newPathForm,
                                credits: e.target.value,
                              })
                            }
                            className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none"
                          />
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] font-black uppercase text-main tracking-widest">
                                  Start Date
                                </label>
                                <Info size={14} className="text-muted/40" />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newPathForm.enableStart}
                                  onChange={(e) =>
                                    setNewPathForm({
                                      ...newPathForm,
                                      enableStart: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 accent-primary"
                                />
                                <span className="text-[10px] font-black uppercase text-main">
                                  Enable
                                </span>
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="date"
                                disabled={!newPathForm.enableStart}
                                value={newPathForm.startDate}
                                onChange={(e) =>
                                  setNewPathForm({
                                    ...newPathForm,
                                    startDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none disabled:opacity-30"
                              />
                              <Calendar
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                                size={18}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <label className="text-[11px] font-black uppercase text-main tracking-widest">
                                  End Date
                                </label>
                                <Info size={14} className="text-muted/40" />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={newPathForm.enableEnd}
                                  onChange={(e) =>
                                    setNewPathForm({
                                      ...newPathForm,
                                      enableEnd: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 accent-primary"
                                />
                                <span className="text-[10px] font-black uppercase text-main">
                                  Enable
                                </span>
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="date"
                                disabled={!newPathForm.enableEnd}
                                value={newPathForm.endDate}
                                onChange={(e) =>
                                  setNewPathForm({
                                    ...newPathForm,
                                    endDate: e.target.value,
                                  })
                                }
                                className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none disabled:opacity-30"
                              />
                              <Calendar
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                                size={18}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Description with Toolbar Mock */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Description
                            </label>
                            <AlertCircle size={14} className="text-red-500" />
                            <Info size={14} className="text-muted/40" />
                          </div>
                          <div className="border border-glass-border rounded-2xl overflow-hidden shadow-inner">
                            <div className="bg-surface border-b border-glass-border p-2 flex flex-wrap gap-1">
                              <ToolbarBtn icon={<Undo size={14} />} />
                              <div className="w-px h-6 bg-glass-border mx-1" />
                              <ToolbarBtn icon={<Type size={14} />} dropdown />
                              <ToolbarBtn icon={<Bold size={14} />} />
                              <ToolbarBtn icon={<Italic size={14} />} />
                              <div className="w-px h-6 bg-glass-border mx-1" />
                              <ToolbarBtn icon={<List size={14} />} />
                              <ToolbarBtn icon={<ListOrdered size={14} />} />
                              <div className="w-px h-6 bg-glass-border mx-1" />
                              <ToolbarBtn icon={<Link size={14} />} />
                              <ToolbarBtn icon={<Scissors size={14} />} />
                              <div className="w-px h-6 bg-glass-border mx-1" />
                              <ToolbarBtn icon={<FileImage size={14} />} />
                              <ToolbarBtn icon={<Video size={14} />} />
                              <ToolbarBtn icon={<Mic size={14} />} />
                              <ToolbarBtn icon={<Webcam size={14} />} />
                              <ToolbarBtn icon={<Accessibility size={14} />} />
                            </div>
                            <textarea
                              value={newPathForm.description}
                              onChange={(e) =>
                                setNewPathForm({
                                  ...newPathForm,
                                  description: e.target.value,
                                })
                              }
                              className="w-full h-48 bg-background/30 p-6 text-xs font-bold focus:outline-none resize-none"
                              placeholder="Write path description here..."
                            />
                          </div>
                        </div>

                        {/* Self Enrollment */}
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={newPathForm.selfEnrollment}
                            onChange={(e) =>
                              setNewPathForm({
                                ...newPathForm,
                                selfEnrollment: e.target.checked,
                              })
                            }
                            className="w-4 h-4 accent-primary"
                          />
                          <label className="text-[11px] font-black uppercase text-main tracking-widest">
                            Self Enrollment
                          </label>
                        </div>

                        {/* Image & Certificate Uploads */}
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-black uppercase text-main tracking-widest">
                                Learning Path Image
                              </label>
                              <AlertCircle size={14} className="text-red-500" />
                              <Info size={14} className="text-muted/40" />
                            </div>
                            <div className="border-2 border-dashed border-glass-border rounded-2xl p-12 bg-primary/5 flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/50 transition-all cursor-pointer">
                              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg text-primary group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-main uppercase">
                                  You can drag and drop files here to add them.
                                </p>
                                <p className="text-[9px] font-bold text-muted uppercase">
                                  Recommended size: 500 x 280 px
                                </p>
                              </div>
                              <button className="bg-primary text-white px-8 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md">
                                Choose A File
                              </button>
                            </div>
                            <div className="text-[9px] font-bold text-muted uppercase space-y-1">
                              <p>Accepted file types:</p>
                              <p>Image (JPEG)</p>
                              <p>Image (PNG)</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Upload Certificate
                            </label>
                            <button className="bg-primary text-white px-8 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-md">
                              Choose A File
                            </button>
                            <div className="border-2 border-dashed border-glass-border rounded-2xl p-12 bg-primary/5 flex flex-col items-center justify-center text-center space-y-4 group hover:border-primary/50 transition-all cursor-pointer">
                              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg text-primary group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-main uppercase">
                                  You can drag and drop files here to add them.
                                </p>
                                <p className="text-[9px] font-bold text-muted uppercase">
                                  Recommended size: 500 x 280 px
                                </p>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-muted uppercase space-y-1">
                              <p>Accepted file types:</p>
                              <p>Image (JPEG)</p>
                              <p>Image (PNG)</p>
                            </div>
                          </div>
                        </div>

                        {/* Location & Instructor */}
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Location
                            </label>
                            <input
                              type="text"
                              value={newPathForm.location}
                              onChange={(e) =>
                                setNewPathForm({
                                  ...newPathForm,
                                  location: e.target.value,
                                })
                              }
                              className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none"
                              placeholder="Enter location..."
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-main tracking-widest">
                              Instructor
                            </label>
                            <div className="relative">
                              <select
                                value={newPathForm.instructor}
                                onChange={(e) =>
                                  setNewPathForm({
                                    ...newPathForm,
                                    instructor: e.target.value,
                                  })
                                }
                                className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 text-xs font-bold focus:border-primary transition-all outline-none appearance-none"
                              >
                                <option value="">Select Instructor</option>
                                <option value="1">Admin User</option>
                              </select>
                              <ChevronDown
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                                size={16}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-4 pt-10 border-t border-glass-border">
                        <button
                          onClick={() => handleCreatePath()}
                          className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setSubTab("Learning Paths")}
                          className="px-12 py-5 bg-surface border border-glass-border text-muted rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-surface-hover transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Step 2 Trigger (Temporary until real flow is decided) */}
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setPathStep(2)}
                        className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-2"
                      >
                        Next Step: Select Courses <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {pathStep === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-700 pb-6">
                    {/* Success Banner Mock */}
                    {pathSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 text-green-600 font-bold text-xs">
                          <Check size={16} /> Changes saved
                        </div>
                        <button
                          onClick={() => setPathSuccess(false)}
                          className="text-green-600/50 hover:text-green-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setPathStep(1)}
                        className="p-2.5 rounded-full bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all border border-glass-border"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <h2 className="text-xl font-black text-main tracking-tight uppercase italic">
                        {newPathForm.name || "Testing"}
                      </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 border-b border-glass-border pb-px overflow-x-auto no-scrollbar -mx-1 px-1">
                      {[
                        "Overview",
                        "Courses",
                        "Users",
                        "Cohorts",
                        "Notifications",
                        "Certificate Content",
                      ].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setPathSubTab(tab)}
                          className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all relative shrink-0 ${pathSubTab === tab ? "bg-primary text-white rounded-t-lg" : "text-muted hover:text-main bg-surface/40 hover:bg-surface border-x border-t border-transparent hover:border-glass-border rounded-t-lg"}`}
                        >
                          {tab}
                          {pathSubTab === tab && (
                            <div className="absolute -bottom-px left-0 right-0 h-1 bg-primary" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content: Overview */}
                    {pathSubTab === "Overview" && (
                      <div className="space-y-5 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                          {/* Left: Image Preview */}
                          <div className="lg:col-span-4">
                            <div className="academy-card aspect-video relative overflow-hidden rounded-[24px] border-none shadow-xl group">
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <img
                                src="/posh_banner.png"
                                alt="Path Banner"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white border border-white/30 hover:bg-white/40 transition-all">
                                  <Camera size={16} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right: Stats Grid */}
                          <div className="lg:col-span-8">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <ManagementStatCard
                                icon={<Calendar size={16} />}
                                label="Start Date"
                                value={
                                  newPathForm.enableStart
                                    ? newPathForm.startDate
                                    : "Not Enabled"
                                }
                                color="emerald"
                              />
                              <ManagementStatCard
                                icon={<Calendar size={16} />}
                                label="End Date"
                                value={
                                  newPathForm.enableEnd
                                    ? newPathForm.endDate
                                    : "Not Enabled"
                                }
                                color="rose"
                              />
                              <ManagementStatCard
                                icon={<GraduationCap size={16} />}
                                label="Required Credits"
                                value={newPathForm.credits}
                                color="amber"
                              />
                              <ManagementStatCard
                                icon={<Users size={16} />}
                                label="Users"
                                value="0"
                                color="sky"
                              />

                              <ManagementStatCard
                                icon={<BookOpen size={16} />}
                                label="Total Courses"
                                value={selectedPathCourses.length}
                                color="indigo"
                              />
                              <ManagementStatCard
                                icon={<Layers size={16} />}
                                label="Total Cohorts"
                                value={
                                  data.cohorts?.length ||
                                  selectedPathCohorts.length ||
                                  0
                                }
                                color="orange"
                              />
                              <ManagementStatCard
                                icon={<ScrollText size={16} />}
                                label="Required Courses"
                                value="0"
                                color="red"
                              />
                              <ManagementStatCard
                                icon={<Users size={16} />}
                                label="Total Users"
                                value="0"
                                color="teal"
                              />
                            </div>
                            <div className="mt-4">
                              <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                                <Rocket size={14} /> Publish Path
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                          <h3 className="text-[11px] font-black uppercase text-muted tracking-widest ml-1">
                            Description
                          </h3>
                          <div className="bg-surface border border-glass-border rounded-xl p-5 shadow-sm">
                            <p className="text-xs font-bold text-main leading-relaxed italic opacity-80">
                              {newPathForm.description ||
                                "No description provided for this learning path."}
                            </p>
                          </div>
                        </div>

                        {/* Properties Section */}
                        <div className="space-y-3">
                          <h3 className="text-[11px] font-black uppercase text-muted tracking-widest ml-1">
                            Properties
                          </h3>
                          <div className="bg-surface border border-glass-border rounded-xl overflow-hidden">
                            <div className="p-5 space-y-5">
                              <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest">
                                  Location:
                                </label>
                                <div className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 flex items-center text-xs font-bold text-main">
                                  {newPathForm.location || "Not Specified"}
                                </div>
                              </div>
                              <div className="space-y-3 border-t border-glass-border pt-5">
                                <label className="text-[10px] font-black uppercase text-muted tracking-widest">
                                  Instructor:
                                </label>
                                <div className="w-full h-14 bg-background/50 border border-glass-border rounded-xl px-6 flex items-center text-xs font-bold text-main">
                                  {newPathForm.instructor === "1"
                                    ? "Admin User"
                                    : "Not Assigned"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Courses Section Section */}
                        <div className="space-y-3 pt-5 border-t border-glass-border">
                          <div className="flex items-center gap-3">
                            <h3 className="text-[11px] font-black uppercase text-main tracking-widest">
                              Dashboard
                            </h3>
                            <button className="p-2 bg-surface border border-glass-border rounded-lg text-muted hover:text-primary transition-all">
                              <Edit2 size={12} />
                            </button>
                          </div>
                          <div className="py-8 text-center">
                            <p className="text-[10px] font-black uppercase text-muted tracking-widest italic">
                              There are no courses to the learning path
                            </p>
                            <button
                              onClick={() => setPathSubTab("Courses")}
                              className="mt-6 text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto"
                            >
                              <Plus size={14} /> Add Courses Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab Content: Courses */}
                    {pathSubTab === "Courses" && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        {!isAddingCourses ? (
                          <div className="space-y-6">
                            {/* List Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/40 p-3 rounded-xl border border-glass-border">
                              <div className="relative flex-grow max-w-md">
                                <Search
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                  size={16}
                                />
                                <input
                                  type="text"
                                  placeholder="Search Courses"
                                  className="w-full h-11 bg-background/50 border border-glass-border rounded-xl pl-12 pr-4 text-xs font-bold focus:border-primary transition-all outline-none"
                                />
                              </div>
                              <button
                                onClick={() => setIsAddingCourses(true)}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                              >
                                Add Courses <Plus size={14} />
                              </button>
                            </div>

                            {/* Courses Table */}
                            {selectedPathCourses.length > 0 ? (
                              <div className="academy-card overflow-hidden rounded-[24px]">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-surface border-b border-glass-border uppercase text-[9px] font-black tracking-widest text-muted">
                                      <th className="p-6 w-16"></th>
                                      <th className="p-6">Course Name</th>
                                      <th className="p-6">Credits</th>
                                      <th className="p-6">Required</th>
                                      <th className="p-6 text-right">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-glass-border text-xs font-bold">
                                    {selectedPathCourses.map((id) => {
                                      const course = data.courses.find(
                                        (c) => c.id === id,
                                      );
                                      return (
                                        <tr
                                          key={id}
                                          className="hover:bg-primary/5 transition-colors group"
                                        >
                                          <td className="p-6 text-center">
                                            <div className="w-6 h-6 rounded-full border-2 border-glass-border group-hover:border-primary/50 transition-all" />
                                          </td>
                                          <td className="p-6 text-main uppercase italic tracking-tight">
                                            {course?.fullname ||
                                              "Unknown Course"}
                                          </td>
                                          <td className="p-6 text-muted tabular-nums">
                                            3
                                          </td>
                                          <td className="p-6">
                                            <div className="w-10 h-5 bg-glass-border rounded-full relative cursor-pointer">
                                              <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                            </div>
                                          </td>
                                          <td className="p-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                              <button className="p-2 bg-surface border border-glass-border rounded-lg text-muted hover:text-primary transition-all flex items-center gap-1">
                                                <Edit2 size={12} /> Edit
                                              </button>
                                              <button
                                                onClick={() =>
                                                  setSelectedPathCourses(
                                                    selectedPathCourses.filter(
                                                      (cid) => cid !== id,
                                                    ),
                                                  )
                                                }
                                                className="p-2 bg-surface border border-glass-border rounded-lg text-muted hover:text-red-500 transition-all"
                                              >
                                                <X size={12} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="py-8 px-4 text-center">
                                <p className="text-[10px] font-black uppercase text-muted tracking-widest italic">
                                  No Records Found.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Dual-Pane Picker Interface */
                          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIsAddingCourses(false)}
                                className="p-2 rounded-full bg-surface border border-glass-border hover:bg-primary/10 hover:text-primary transition-all"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <h3 className="text-sm font-black uppercase text-main italic tracking-tight">
                                Add/Remove Courses
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                              {/* Left Panel: Added Courses */}
                              <div className="lg:col-span-5 academy-card p-0 rounded-[20px] overflow-hidden flex flex-col h-[600px] border-none shadow-xl">
                                <div className="p-6 space-y-4 border-b border-glass-border">
                                  <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">
                                    Courses Added
                                  </h4>
                                  <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                      <Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                        size={14}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full h-11 bg-background/50 border border-glass-border rounded-lg pl-10 pr-4 text-xs font-bold focus:border-primary outline-none"
                                      />
                                    </div>
                                    <button className="px-4 h-11 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                      Clear
                                    </button>
                                    <button className="px-4 h-11 bg-surface border border-glass-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                      Search options <ChevronRight size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface/30 custom-scrollbar">
                                  <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase text-main tracking-widest">
                                      Courses in Learningpath (
                                      {selectedPathCourses.length})
                                    </p>
                                    {selectedPathCourses.map((id) => {
                                      const course = data.courses.find(
                                        (c) => c.id === id,
                                      );
                                      return (
                                        <div
                                          key={id}
                                          className="text-xs font-bold text-main opacity-80 pl-4"
                                        >
                                          {course?.fullname || id}
                                        </div>
                                      );
                                    })}
                                    {selectedPathCourses.length === 0 && (
                                      <p className="text-[10px] font-bold text-muted uppercase italic pl-4">
                                        None
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Buttons */}
                              <div className="lg:col-span-1 flex flex-col items-center gap-4">
                                <button className="w-full py-3 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                  Add
                                </button>
                                <div className="flex flex-col items-center opacity-40">
                                  <ChevronUp size={16} />
                                  <ChevronDown size={16} />
                                </div>
                                <button className="w-full py-3 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                  Remove
                                </button>
                              </div>

                              {/* Right Panel: Potential Courses */}
                              <div className="lg:col-span-5 academy-card p-0 rounded-[20px] overflow-hidden flex flex-col h-[600px] border-none shadow-xl">
                                <div className="p-6 space-y-4 border-b border-glass-border">
                                  <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">
                                    Potential courses to add
                                  </h4>
                                  <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                      <Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                        size={14}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full h-11 bg-background/50 border border-glass-border rounded-lg pl-10 pr-4 text-xs font-bold focus:border-primary outline-none"
                                      />
                                    </div>
                                    <button className="px-4 h-11 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                      Clear
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface/30 custom-scrollbar">
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-main tracking-widest">
                                      Available courses (
                                      {data.courses?.length || 0})
                                    </p>
                                    {data.courses
                                      ?.filter(
                                        (c) =>
                                          !selectedPathCourses.includes(c.id),
                                      )
                                      .map((course) => (
                                        <div
                                          key={course.id}
                                          onClick={() =>
                                            setSelectedPathCourses([
                                              ...selectedPathCourses,
                                              course.id,
                                            ])
                                          }
                                          className="text-xs font-bold text-main opacity-80 pl-4 hover:text-primary cursor-pointer transition-colors"
                                        >
                                          {course.fullname}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab Content: Users */}
                    {pathSubTab === "Users" && (
                      <div className="space-y-8 animate-in fade-in duration-500">
                        {!isAddingUsers ? (
                          <div className="space-y-6">
                            {/* List Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/40 p-3 rounded-xl border border-glass-border">
                              <div className="relative flex-grow max-w-md">
                                <Search
                                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                  size={16}
                                />
                                <input
                                  type="text"
                                  placeholder="Search Learning Path Users"
                                  className="w-full h-11 bg-background/50 border border-glass-border rounded-xl pl-12 pr-4 text-xs font-bold focus:border-primary transition-all outline-none"
                                />
                              </div>
                              <button
                                onClick={() => setIsAddingUsers(true)}
                                className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                              >
                                Enrol Users <Plus size={14} />
                              </button>
                            </div>

                            {/* Users List / Table */}
                            {selectedPathUsers.length > 0 ? (
                              <div className="academy-card overflow-hidden rounded-[24px]">
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className="bg-surface border-b border-glass-border uppercase text-[9px] font-black tracking-widest text-muted">
                                      <th className="p-6">User Name</th>
                                      <th className="p-6">Email</th>
                                      <th className="p-6 text-right">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-glass-border text-xs font-bold">
                                    {selectedPathUsers.map((id) => {
                                      const user = data.users.find(
                                        (u) => u.id === id,
                                      );
                                      return (
                                        <tr
                                          key={id}
                                          className="hover:bg-primary/5 transition-colors group"
                                        >
                                          <td className="p-6 text-main uppercase italic tracking-tight">
                                            {user?.firstname} {user?.lastname}
                                          </td>
                                          <td className="p-6 text-muted font-medium">
                                            {user?.email}
                                          </td>
                                          <td className="p-6 text-right">
                                            <button
                                              onClick={() =>
                                                setSelectedPathUsers(
                                                  selectedPathUsers.filter(
                                                    (uid) => uid !== id,
                                                  ),
                                                )
                                              }
                                              className="p-2 bg-surface border border-glass-border rounded-lg text-muted hover:text-red-500 transition-all"
                                            >
                                              <X size={12} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="py-8 px-4 text-center">
                                <p className="text-[10px] font-black uppercase text-muted tracking-widest italic">
                                  No Records Found.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Dual-Pane User Picker Interface */
                          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setIsAddingUsers(false)}
                                className="p-2 rounded-full bg-surface border border-glass-border hover:bg-primary/10 hover:text-primary transition-all"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <h3 className="text-sm font-black uppercase text-main italic tracking-tight">
                                Add/Remove Users
                              </h3>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
                              {/* Left Panel: Added Users */}
                              <div className="lg:col-span-5 academy-card p-0 rounded-[20px] overflow-hidden flex flex-col h-[600px] border-none shadow-xl">
                                <div className="p-6 space-y-4 border-b border-glass-border">
                                  <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">
                                    Added users
                                  </h4>
                                  <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                      <Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                        size={14}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full h-11 bg-background/50 border border-glass-border rounded-lg pl-10 pr-4 text-xs font-bold focus:border-primary outline-none"
                                      />
                                    </div>
                                    <button className="px-4 h-11 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                      Clear
                                    </button>
                                    <button className="px-4 h-11 bg-surface border border-glass-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                      Search options <ChevronRight size={12} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface/30 custom-scrollbar">
                                  <div className="space-y-2">
                                    {selectedPathUsers.map((id) => {
                                      const user = data.users.find(
                                        (u) => u.id === id,
                                      );
                                      return (
                                        <div
                                          key={id}
                                          className="text-xs font-bold text-main opacity-80 pl-4"
                                        >
                                          {user?.firstname} {user?.lastname} (
                                          {user?.email})
                                        </div>
                                      );
                                    })}
                                    {selectedPathUsers.length === 0 && (
                                      <p className="text-xs font-bold text-muted uppercase pl-4">
                                        None
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Middle Buttons */}
                              <div className="lg:col-span-1 flex flex-col items-center gap-4">
                                <button className="w-full py-3 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                  Add
                                </button>
                                <div className="flex flex-col items-center opacity-40">
                                  <ChevronUp size={16} />
                                  <ChevronDown size={16} />
                                </div>
                                <button className="w-full py-3 bg-primary text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                  Remove
                                </button>
                              </div>

                              {/* Right Panel: Potential Users */}
                              <div className="lg:col-span-5 academy-card p-0 rounded-[20px] overflow-hidden flex flex-col h-[600px] border-none shadow-xl">
                                <div className="p-6 space-y-4 border-b border-glass-border">
                                  <h4 className="text-[10px] font-black uppercase text-muted tracking-widest">
                                    Potential users to add
                                  </h4>
                                  <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                      <Search
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                                        size={14}
                                      />
                                      <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full h-11 bg-background/50 border border-glass-border rounded-lg pl-10 pr-4 text-xs font-bold focus:border-primary outline-none"
                                      />
                                    </div>
                                    <button className="px-4 h-11 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                      Clear
                                    </button>
                                  </div>
                                </div>
                                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface/30 custom-scrollbar">
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-main tracking-widest">
                                      Available users ({data.users?.length || 0}
                                      )
                                    </p>
                                    {data.users
                                      ?.filter(
                                        (u) =>
                                          !selectedPathUsers.includes(u.id),
                                      )
                                      .map((user) => (
                                        <div
                                          key={user.id}
                                          onClick={() =>
                                            setSelectedPathUsers([
                                              ...selectedPathUsers,
                                              user.id,
                                            ])
                                          }
                                          className="text-xs font-bold text-main opacity-80 pl-4 hover:text-primary cursor-pointer transition-colors"
                                        >
                                          {user.firstname} {user.lastname} (
                                          {user.email})
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab Content: Cohorts */}
                    {pathSubTab === "Cohorts" && (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/40 p-3 rounded-xl border border-glass-border">
                          <div className="relative flex-grow max-w-md">
                            <Search
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                              size={16}
                            />
                            <input
                              type="text"
                              value={cohortSearchQuery}
                              onChange={(e) =>
                                setCohortSearchQuery(e.target.value)
                              }
                              placeholder="Search Cohorts"
                              className="w-full h-11 bg-background/50 border border-glass-border rounded-xl pl-12 pr-4 text-xs font-bold focus:border-primary transition-all outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setShowCohortModal(true)}
                              className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                            >
                              Add Cohorts <Plus size={14} />
                            </button>
                            <button
                              onClick={handleDeleteCohorts}
                              disabled={selectedCohortIds.length === 0}
                              className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-glass-border bg-surface text-muted hover:text-red-500 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              Delete <X size={14} />
                            </button>
                          </div>
                        </div>

                        {filteredCohorts.length > 0 ? (
                          <div className="academy-card overflow-hidden rounded-[24px]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-surface border-b border-glass-border uppercase text-[9px] font-black tracking-widest text-muted">
                                  <th className="p-4 w-12">
                                    <div
                                      onClick={() => {
                                        if (
                                          selectedCohortIds.length ===
                                          filteredCohorts.length
                                        )
                                          setSelectedCohortIds([]);
                                        else
                                          setSelectedCohortIds(
                                            filteredCohorts.map((c) => c.id),
                                          );
                                      }}
                                      className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCohortIds.length === filteredCohorts.length && filteredCohorts.length > 0 ? "bg-primary border-primary text-white" : "border-glass-border"}`}
                                    >
                                      {selectedCohortIds.length ===
                                        filteredCohorts.length &&
                                        filteredCohorts.length > 0 && (
                                          <Check size={12} />
                                        )}
                                    </div>
                                  </th>
                                  <th className="p-6">Cohort Name</th>
                                  <th className="p-6">Enrollment Date</th>
                                  <th className="p-6">Users</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-glass-border text-xs font-bold">
                                {filteredCohorts.map((cohort) => (
                                  <tr
                                    key={cohort.id}
                                    className={`hover:bg-primary/5 transition-colors ${selectedCohortIds.includes(cohort.id) ? "bg-primary/5" : ""}`}
                                  >
                                    <td className="p-6">
                                      <div
                                        onClick={() => {
                                          if (
                                            selectedCohortIds.includes(
                                              cohort.id,
                                            )
                                          )
                                            setSelectedCohortIds(
                                              selectedCohortIds.filter(
                                                (id) => id !== cohort.id,
                                              ),
                                            );
                                          else
                                            setSelectedCohortIds([
                                              ...selectedCohortIds,
                                              cohort.id,
                                            ]);
                                        }}
                                        className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCohortIds.includes(cohort.id) ? "bg-primary border-primary text-white" : "border-glass-border"}`}
                                      >
                                        {selectedCohortIds.includes(
                                          cohort.id,
                                        ) && <Check size={12} />}
                                      </div>
                                    </td>
                                    <td className="p-6 text-main uppercase italic tracking-tight">
                                      {cohort.name}
                                    </td>
                                    <td className="p-6 text-muted font-medium">
                                      <span className="inline-flex items-center gap-2">
                                        <Calendar
                                          size={14}
                                          className="text-primary/60"
                                        />
                                        {formatCohortDate(cohort)}
                                      </span>
                                    </td>
                                    <td className="p-4 text-main">
                                      {cohort.memberCount ?? 0}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="py-8 px-4 text-center">
                            <p className="text-[10px] font-black uppercase text-muted tracking-widest italic">
                              No Records Found.
                            </p>
                          </div>
                        )}

                        {selectedPathCohorts.length > 0 && (
                          <p className="text-[10px] font-bold uppercase text-muted tracking-widest">
                            {selectedPathCohorts.length} cohort(s) linked to
                            this learning path
                          </p>
                        )}
                      </div>
                    )}

                    {/* Tab Content: Notifications */}
                    {pathSubTab === "Notifications" && (
                      <div className="space-y-4 animate-in fade-in duration-500 pb-6">
                        {!editingPath?.id ? (
                          <div className="py-10 text-center bg-surface/20 rounded-xl border border-glass-border border-dashed">
                            <Bell
                              size={40}
                              className="mx-auto text-primary mb-4"
                            />
                            <p className="text-[10px] font-black uppercase text-muted tracking-widest">
                              Save the learning path first to configure email
                              notifications.
                            </p>
                          </div>
                        ) : (
                          <>
                            <NotificationSectionBar title="Enrollment" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <NotificationEnableRow
                                label="Email Template"
                                enabled={pathNotifications.enrollment?.enabled}
                                onEnabledChange={(v) =>
                                  updateNotificationBlock("enrollment", {
                                    enabled: v,
                                  })
                                }
                              />
                              <EmailTemplateEditor
                                value={pathNotifications.enrollment?.body || ""}
                                onChange={(body) =>
                                  updateNotificationBlock("enrollment", {
                                    body,
                                  })
                                }
                              />
                              <NotificationTagsFooter />
                            </div>

                            <NotificationSectionBar title="Expiration" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <NotificationEnableRow
                                label="Email Template"
                                enabled={pathNotifications.expiration?.enabled}
                                onEnabledChange={(v) =>
                                  updateNotificationBlock("expiration", {
                                    enabled: v,
                                  })
                                }
                              />
                              <EmailTemplateEditor
                                value={pathNotifications.expiration?.body || ""}
                                onChange={(body) =>
                                  updateNotificationBlock("expiration", {
                                    body,
                                  })
                                }
                              />
                              <NotificationTagsFooter />
                            </div>

                            <NotificationSectionBar title="Enrollment Reminder" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <EmailTemplateEditor
                                value={
                                  pathNotifications.enrollmentReminder?.body ||
                                  ""
                                }
                                onChange={(body) =>
                                  updateNotificationBlock(
                                    "enrollmentReminder",
                                    { body },
                                  )
                                }
                              />
                              <NotificationTagsFooter />
                              <input
                                type="text"
                                value={
                                  pathNotifications.enrollmentReminder
                                    ?.subject || ""
                                }
                                onChange={(e) =>
                                  updateNotificationBlock(
                                    "enrollmentReminder",
                                    { subject: e.target.value },
                                  )
                                }
                                className="w-full h-12 bg-background/50 border border-glass-border rounded-xl px-5 text-xs font-bold focus:border-primary outline-none"
                                placeholder="Email subject"
                              />
                              <div className="flex flex-wrap items-center gap-4">
                                <span className="text-[11px] font-black uppercase text-main tracking-widest">
                                  Days After Enrollment
                                </span>
                                <NotificationEnableRow
                                  label="Enable"
                                  enabled={
                                    pathNotifications.enrollmentReminder
                                      ?.enabled
                                  }
                                  onEnabledChange={(v) =>
                                    updateNotificationBlock(
                                      "enrollmentReminder",
                                      { enabled: v },
                                    )
                                  }
                                  inline
                                />
                                <input
                                  type="number"
                                  min="0"
                                  disabled={
                                    !pathNotifications.enrollmentReminder
                                      ?.enabled
                                  }
                                  value={
                                    pathNotifications.enrollmentReminder
                                      ?.daysAfterEnrollment ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNotificationBlock(
                                      "enrollmentReminder",
                                      {
                                        daysAfterEnrollment:
                                          parseInt(e.target.value, 10) || 0,
                                      },
                                    )
                                  }
                                  className="w-24 h-11 bg-background/50 border border-glass-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none disabled:opacity-40"
                                />
                              </div>
                            </div>

                            <NotificationSectionBar title="Expiration Reminder" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <div className="flex flex-wrap items-center gap-4">
                                <span className="text-[11px] font-black uppercase text-main tracking-widest">
                                  Days Before Expiration
                                </span>
                                <NotificationEnableRow
                                  label="Enable"
                                  enabled={
                                    pathNotifications.expirationReminder
                                      ?.enabled
                                  }
                                  onEnabledChange={(v) =>
                                    updateNotificationBlock(
                                      "expirationReminder",
                                      { enabled: v },
                                    )
                                  }
                                  inline
                                />
                                <input
                                  type="number"
                                  min="0"
                                  disabled={
                                    !pathNotifications.expirationReminder
                                      ?.enabled
                                  }
                                  value={
                                    pathNotifications.expirationReminder
                                      ?.daysBeforeExpiration ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNotificationBlock(
                                      "expirationReminder",
                                      {
                                        daysBeforeExpiration:
                                          parseInt(e.target.value, 10) || 0,
                                      },
                                    )
                                  }
                                  className="w-24 h-11 bg-background/50 border border-glass-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none disabled:opacity-40"
                                />
                              </div>
                              <span className="text-[11px] font-black uppercase text-main tracking-widest">
                                Email Template
                              </span>
                              <EmailTemplateEditor
                                value={
                                  pathNotifications.expirationReminder?.body ||
                                  ""
                                }
                                onChange={(body) =>
                                  updateNotificationBlock(
                                    "expirationReminder",
                                    { body },
                                  )
                                }
                              />
                              <NotificationTagsFooter />
                            </div>

                            <NotificationSectionBar title="Completion Reminder" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <div className="flex flex-wrap items-center gap-4">
                                <span className="text-[11px] font-black uppercase text-main tracking-widest">
                                  Day Frequency
                                </span>
                                <NotificationEnableRow
                                  label="Enable"
                                  enabled={
                                    pathNotifications.completionReminder
                                      ?.enabled
                                  }
                                  onEnabledChange={(v) =>
                                    updateNotificationBlock(
                                      "completionReminder",
                                      { enabled: v },
                                    )
                                  }
                                  inline
                                />
                                <input
                                  type="number"
                                  min="0"
                                  disabled={
                                    !pathNotifications.completionReminder
                                      ?.enabled
                                  }
                                  value={
                                    pathNotifications.completionReminder
                                      ?.dayFrequency ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNotificationBlock(
                                      "completionReminder",
                                      {
                                        dayFrequency:
                                          parseInt(e.target.value, 10) || 0,
                                      },
                                    )
                                  }
                                  className="w-24 h-11 bg-background/50 border border-glass-border rounded-xl px-4 text-xs font-bold focus:border-primary outline-none disabled:opacity-40"
                                />
                              </div>
                              <span className="text-[11px] font-black uppercase text-main tracking-widest">
                                Email Template
                              </span>
                              <EmailTemplateEditor
                                value={
                                  pathNotifications.completionReminder?.body ||
                                  ""
                                }
                                onChange={(body) =>
                                  updateNotificationBlock(
                                    "completionReminder",
                                    { body },
                                  )
                                }
                              />
                              <NotificationTagsFooter />
                            </div>

                            <NotificationSectionBar title="Path Completion" />
                            <div className="academy-card p-5 space-y-4 border border-glass-border rounded-xl">
                              <NotificationEnableRow
                                label="Email Template"
                                enabled={
                                  pathNotifications.pathCompletion?.enabled
                                }
                                onEnabledChange={(v) =>
                                  updateNotificationBlock("pathCompletion", {
                                    enabled: v,
                                  })
                                }
                              />
                              <EmailTemplateEditor
                                value={
                                  pathNotifications.pathCompletion?.body || ""
                                }
                                onChange={(body) =>
                                  updateNotificationBlock("pathCompletion", {
                                    body,
                                  })
                                }
                              />
                              <NotificationTagsFooter />
                            </div>

                            <div className="flex flex-wrap justify-center gap-3 pt-4">
                              <button
                                onClick={handleSaveNotifications}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={handleCancelNotifications}
                                className="px-6 py-2.5 bg-surface border border-glass-border text-muted rounded-xl font-black text-[10px] uppercase tracking-widest hover:text-main transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {pathSubTab === "Certificate Content" && (
                      <div className="py-20 text-center animate-in fade-in duration-500 bg-surface/20 rounded-[32px] border border-glass-border border-dashed">
                        <div className="w-20 h-20 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                          <ScrollText size={32} />
                        </div>
                        <h3 className="text-xl font-black text-main uppercase italic tracking-tight">
                          Certificate Content
                        </h3>
                        <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed italic opacity-70">
                          Certificate templates for "{newPathForm.name}" will be
                          available here soon.
                        </p>
                        <button
                          onClick={() => setPathSubTab("Overview")}
                          className="mt-10 px-8 py-3 bg-surface border border-glass-border text-muted hover:text-primary rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                          Back to Overview
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {subTab === "Manage cohorts" && (
            <div className="space-y-4 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
              <div className="flex flex-wrap justify-between items-center gap-3 bg-surface/60 p-4 rounded-xl border border-glass-border shadow-sm">
                <div>
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-main">
                    Cohort Groups
                  </h3>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                    Manage Moodle cohorts — Students, Teachers, Managers, etc.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 bg-surface/40 p-3 rounded-xl border border-glass-border">
                <div className="relative flex-grow min-w-[200px] max-w-md">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    size={16}
                  />
                  <input
                    type="text"
                    value={cohortSearchQuery}
                    onChange={(e) => setCohortSearchQuery(e.target.value)}
                    placeholder="Search Cohorts"
                    className="w-full h-11 bg-background/50 border border-glass-border rounded-xl pl-12 pr-4 text-xs font-bold focus:border-primary transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCohortModal(true)}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                  >
                    Add Cohorts <Plus size={14} />
                  </button>
                  <button
                    onClick={handleDeleteCohorts}
                    disabled={selectedCohortIds.length === 0}
                    className="px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-glass-border bg-surface text-muted hover:text-red-500 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Delete <X size={14} />
                  </button>
                </div>
              </div>

              {filteredCohorts.length > 0 ? (
                <div className="academy-card overflow-hidden rounded-[24px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface border-b border-glass-border uppercase text-[9px] font-black tracking-widest text-muted">
                        <th className="p-4 w-12">
                          <div
                            onClick={() => {
                              if (
                                selectedCohortIds.length ===
                                filteredCohorts.length
                              )
                                setSelectedCohortIds([]);
                              else
                                setSelectedCohortIds(
                                  filteredCohorts.map((c) => c.id),
                                );
                            }}
                            className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCohortIds.length === filteredCohorts.length && filteredCohorts.length > 0 ? "bg-primary border-primary text-white" : "border-glass-border"}`}
                          >
                            {selectedCohortIds.length ===
                              filteredCohorts.length &&
                              filteredCohorts.length > 0 && <Check size={12} />}
                          </div>
                        </th>
                        <th className="p-4">Cohort Name</th>
                        <th className="p-4">Enrollment Date</th>
                        <th className="p-4">Users</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border text-xs font-bold">
                      {filteredCohorts.map((cohort) => (
                        <tr
                          key={cohort.id}
                          className={`hover:bg-primary/5 transition-colors ${selectedCohortIds.includes(cohort.id) ? "bg-primary/5" : ""}`}
                        >
                          <td className="p-4">
                            <div
                              onClick={() => {
                                if (selectedCohortIds.includes(cohort.id))
                                  setSelectedCohortIds(
                                    selectedCohortIds.filter(
                                      (id) => id !== cohort.id,
                                    ),
                                  );
                                else
                                  setSelectedCohortIds([
                                    ...selectedCohortIds,
                                    cohort.id,
                                  ]);
                              }}
                              className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCohortIds.includes(cohort.id) ? "bg-primary border-primary text-white" : "border-glass-border"}`}
                            >
                              {selectedCohortIds.includes(cohort.id) && (
                                <Check size={12} />
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-main uppercase italic tracking-tight">
                            {cohort.name}
                          </td>
                          <td className="p-4 text-muted font-medium">
                            <span className="inline-flex items-center gap-2">
                              <Calendar size={14} className="text-primary/60" />
                              {formatCohortDate(cohort)}
                            </span>
                          </td>
                          <td className="p-4 text-main">
                            {cohort.memberCount ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 px-4 text-center">
                  <p className="text-[10px] font-black uppercase text-muted tracking-widest italic">
                    No Records Found.
                  </p>
                </div>
              )}
            </div>
          )}

          {subTab === "Define roles" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="academy-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                      <th className="p-6">Role Name</th>
                      <th className="p-6">Shortname</th>
                      <th className="p-6">Description</th>
                      <th className="p-6 text-right">ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border text-xs font-bold">
                    {data.roles?.map((r) => (
                      <tr
                        key={r.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-6 text-primary">{r.name}</td>
                        <td className="p-6 text-muted font-medium uppercase tracking-widest text-[10px]">
                          {r.shortname}
                        </td>
                        <td className="p-6 text-muted opacity-60 font-medium max-w-md truncate">
                          {r.description || "No description provided"}
                        </td>
                        <td className="p-6 text-muted uppercase text-right">
                          #{r.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subTab === "Assign system roles" && (
            <div className="max-w-4xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-surface p-10 rounded-3xl border border-glass-border shadow-xl space-y-8">
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-main">
                      System Assignment
                    </h3>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">
                      Assign global permissions to users
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">
                      Select User
                    </p>
                    <div className="relative">
                      <select
                        value={roleForm.userid}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, userid: e.target.value })
                        }
                        className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                      >
                        <option value="">Choose a user...</option>
                        {data.users
                          ?.filter(
                            (u) =>
                              !data.systemAssignments?.some(
                                (a) => parseInt(a.userid) === parseInt(u.id),
                              ),
                          )
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullname} ({u.email})
                            </option>
                          ))}
                      </select>
                      <ChevronDown
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase text-muted tracking-widest ml-1">
                      Select Role
                    </p>
                    <div className="relative">
                      <select
                        value={roleForm.roleid}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, roleid: e.target.value })
                        }
                        className="academy-input w-full h-16 bg-background/50 border border-glass-border px-6 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                      >
                        <option value="">Choose a role...</option>
                        {data.roles?.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-6">
                  <Info className="text-primary flex-shrink-0 mt-1" size={20} />
                  <p className="text-[11px] font-medium leading-relaxed text-main/80">
                    Warning: Assigning system roles gives users broad
                    permissions across the entire platform. System roles (like
                    Manager or Course Creator) are global. For course-specific
                    teaching roles, use the Enrollments area within individual
                    courses.
                  </p>
                </div>
                <div className="pt-10 border-t border-glass-border space-y-8">
                  <div>
                    <h4 className="text-sm font-black italic uppercase tracking-wider">
                      Current Global Assignments
                    </h4>
                    <p className="text-[9px] font-bold text-muted uppercase tracking-widest mt-1">
                      Manage existing permissions
                    </p>
                  </div>
                  <div className="academy-card overflow-hidden">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="border-b border-glass-border bg-white/5 uppercase text-[8px] font-black tracking-widest text-primary/60">
                          <th className="p-6">User</th>
                          <th className="p-6">Role</th>
                          <th className="p-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass-border font-bold">
                        {data.systemAssignments?.map((a, i) => {
                          const user = data.users.find(
                            (u) => u.id === a.userid,
                          );
                          const role = data.roles.find(
                            (r) => r.id === a.roleid,
                          );
                          return (
                            <tr
                              key={i}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td className="p-6">
                                <div className="flex flex-col">
                                  <span className="text-main">
                                    {user?.fullname || "Loading..."}
                                  </span>
                                  <span className="text-muted text-[8px]">
                                    {user?.email}
                                  </span>
                                </div>
                              </td>
                              <td className="p-6">
                                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] uppercase">
                                  {role?.name || a.roleid}
                                </span>
                              </td>
                              <td className="p-6 text-right">
                                <button
                                  onClick={() =>
                                    handleUnassignRole(a.userid, a.roleid)
                                  }
                                  className="text-red-500 hover:underline uppercase text-[8px] font-black tracking-widest"
                                >
                                  Revoke
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {(!data.systemAssignments ||
                          data.systemAssignments.length === 0) && (
                          <tr>
                            <td
                              colSpan="3"
                              className="p-10 text-center text-muted uppercase text-[8px] tracking-widest"
                            >
                              No global assignments found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button
                  onClick={handleAssignRole}
                  disabled={loading}
                  className="w-full bg-primary text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Finalize Assignment"}
                </button>
              </div>
            </div>
          )}

          {subTab === "Manage courses" && (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
              <div className="flex justify-between items-center bg-surface/60 p-6 rounded-3xl border border-glass-border shadow-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-main">
                      Manage Courses
                    </h3>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                      View, edit, and organize all available courses
                    </p>
                  </div>
                  {selectedCourseIds.length > 0 && (
                    <button
                      onClick={handleBulkDeleteCourses}
                      className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all animate-in zoom-in-95"
                    >
                      <X size={14} /> Delete Selected (
                      {selectedCourseIds.length})
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSubTab("Add course")}
                  className="bg-primary text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <Plus size={16} /> Create New Course
                </button>
              </div>

              <div className="academy-card overflow-hidden text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glass-border bg-white/5 uppercase text-[9px] font-black tracking-[0.2em] text-primary/60">
                      <th className="p-6 w-12">
                        <div
                          onClick={() => {
                            if (
                              selectedCourseIds.length === data.courses.length
                            )
                              setSelectedCourseIds([]);
                            else
                              setSelectedCourseIds(
                                data.courses.map((c) => c.id),
                              );
                          }}
                          className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCourseIds.length === data.courses.length && data.courses.length > 0 ? "bg-primary border-primary text-white" : "border-glass-border"}`}
                        >
                          {selectedCourseIds.length === data.courses.length &&
                            data.courses.length > 0 && <Check size={12} />}
                        </div>
                      </th>
                      <th className="p-6">Course Name</th>
                      <th className="p-6">Shortname</th>
                      <th className="p-6">Category</th>
                      <th className="p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border text-xs font-bold">
                    {data.courses?.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-white/5 transition-colors group ${selectedCourseIds.includes(c.id) ? "bg-primary/5" : ""}`}
                      >
                        <td className="p-6">
                          <div
                            onClick={() => {
                              if (selectedCourseIds.includes(c.id))
                                setSelectedCourseIds(
                                  selectedCourseIds.filter((id) => id !== c.id),
                                );
                              else
                                setSelectedCourseIds([
                                  ...selectedCourseIds,
                                  c.id,
                                ]);
                            }}
                            className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center cursor-pointer transition-all ${selectedCourseIds.includes(c.id) ? "bg-primary border-primary text-white" : "border-glass-border group-hover:border-primary/50"}`}
                          >
                            {selectedCourseIds.includes(c.id) && (
                              <Check size={12} />
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                              {c.imageurl ? (
                                <img
                                  src={c.imageurl}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BookOpen size={20} />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-main uppercase tracking-tighter text-sm">
                                {c.fullname}
                              </span>
                              <span className="text-muted text-[10px] font-medium line-clamp-1 max-w-xs">
                                {c.summary?.replace(/<[^>]*>/g, "") ||
                                  "No summary provided"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-muted font-medium uppercase tracking-widest text-[10px]">
                          {c.shortname}
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-surface border border-glass-border rounded-full text-[9px] uppercase text-muted">
                            {data.categories.find(
                              (cat) => cat.id == c.categoryid,
                            )?.name || `Category #${c.categoryid}`}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCourse(c);
                                setCourseForm({
                                  fullname: c.fullname,
                                  categoryid: c.categoryid,
                                  summary: c.summary,
                                  imageurl: c.imageurl,
                                });
                                setShowModal("Edit Course");
                                setModalSection("general");
                              }}
                              className="p-3 hover:bg-primary hover:text-white rounded-xl transition-all border border-glass-border text-muted"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-3 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-glass-border text-muted"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!data.courses || data.courses.length === 0) && (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-20 text-center text-muted uppercase text-[10px] tracking-[0.3em]"
                        >
                          No courses found in database
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {subTab === "Add course" && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
              {courseStep < 4 && (
                <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-widest text-muted">
                  <div
                    className={`flex items-center gap-2 ${courseStep >= 1 ? "text-primary" : ""}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 1 ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}
                    >
                      1
                    </span>
                    Creation Method
                  </div>{" "}
                  <ChevronRight size={14} />
                  <div
                    className={`flex items-center gap-2 ${courseStep >= 2 ? "text-primary" : ""}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 2 ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}
                    >
                      2
                    </span>
                    Configure Course
                  </div>{" "}
                  <ChevronRight size={14} />
                  <div
                    className={`flex items-center gap-2 ${courseStep >= 3 ? "text-primary" : ""}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${courseStep >= 3 ? "bg-primary text-white" : "bg-primary/20 text-primary"}`}
                    >
                      3
                    </span>
                    Course Image
                  </div>
                </div>
              )}

              {courseStep === 1 && (
                <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                  <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-black text-main">
                      Choose Creation Method
                    </h3>
                    <p className="text-muted text-[10px] uppercase tracking-widest font-bold">
                      How would you like to start building your new course?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 max-w-3xl">
                    <div
                      onClick={() => setCourseStep(2)}
                      className="bg-background/50 border border-glass-border rounded-[24px] p-8 cursor-pointer hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all group flex flex-col items-center text-center"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FilePlus size={28} />
                      </div>
                      <h4 className="text-sm font-black text-main uppercase tracking-widest">
                        Start from Scratch
                      </h4>
                      <p className="text-xs text-muted font-bold mt-3 leading-relaxed">
                        Build a completely blank course and structure it
                        manually with your own content.
                      </p>
                    </div>

                    <div className="bg-background/50 border border-glass-border rounded-[24px] p-8 opacity-50 cursor-not-allowed flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-muted">
                        Coming Soon
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 text-muted flex items-center justify-center mb-6">
                        <Sparkles size={28} />
                      </div>
                      <h4 className="text-sm font-black text-main uppercase tracking-widest">
                        AI Generated
                      </h4>
                      <p className="text-xs text-muted font-bold mt-3 leading-relaxed">
                        Let Antigravity AI generate a complete course structure
                        and outline based on a topic.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {courseStep === 2 && (
                <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-6">
                  <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-black text-main">
                      Configure Course
                    </h3>
                    <p className="text-muted text-[10px] uppercase tracking-widest font-bold">
                      Fill in the basic details for the course.
                    </p>
                  </div>
                  <CompactInput
                    label="Course Name"
                    req
                    value={courseForm.fullname}
                    onChange={(v) =>
                      setCourseForm({ ...courseForm, fullname: v })
                    }
                  />
                  <CompactSelect
                    label="Course Category"
                    value={courseForm.categoryid}
                    options={[
                      { v: "", l: "Select Category" },
                      ...data.categories.map((c) => ({ v: c.id, l: c.name })),
                    ]}
                    onChange={(v) =>
                      setCourseForm({ ...courseForm, categoryid: v })
                    }
                  />

                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-muted tracking-widest">
                      Course Summary
                    </label>
                    <textarea
                      value={courseForm.summary}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          summary: e.target.value,
                        })
                      }
                      className="academy-input w-full h-32 bg-background/50 border border-glass-border p-6 text-xs font-bold focus:border-primary transition-all outline-none resize-none"
                      placeholder="Describe what students will learn in this course"
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-6 border-t border-glass-border">
                    <button className="px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 text-muted hover:bg-glass-border transition-all">
                      Back
                    </button>
                    <button
                      onClick={() => setCourseStep(3)}
                      disabled={!courseForm.fullname}
                      className="px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {courseStep === 3 && (
                <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                  <div className="space-y-2 mb-8 border-b border-glass-border pb-6">
                    <h3 className="text-xl font-black text-main">
                      Add Course Image
                    </h3>
                  </div>

                  <div className="flex gap-14">
                    <div className="w-1/3 flex flex-col gap-6 pt-2">
                      <button
                        onClick={() => alert("Simulating Image Gallery Search")}
                        className="w-full bg-primary text-white py-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 h-36"
                      >
                        <Search size={28} />
                        <span className="text-center leading-tight">
                          Search in
                          <br />
                          Image Gallery
                        </span>
                      </button>

                      <div className="flex items-center gap-4">
                        <div className="h-px bg-glass-border flex-grow"></div>
                        <div className="text-muted font-black text-[10px] uppercase tracking-widest">
                          or
                        </div>
                        <div className="h-px bg-glass-border flex-grow"></div>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={async (e) => {
                          const f = e.target.files[0];
                          if (!f) return;
                          const formData = new FormData();
                          formData.append("image", f);
                          setLoading(true);
                          try {
                            const res = await fetch(
                              "http://localhost:4000/api/system/upload",
                              { method: "POST", body: formData },
                            ).then((r) => r.json());
                            if (res.url)
                              setCourseForm({
                                ...courseForm,
                                imageurl: res.url,
                              });
                          } catch (e) {}
                          setLoading(false);
                        }}
                        className="hidden"
                        accept="image/*"
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-primary/5 border-2 border-dashed border-primary/30 text-primary py-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary transition-all font-black text-[11px] uppercase tracking-widest h-36"
                      >
                        <Camera size={28} />
                        <span>Upload</span>
                      </button>

                      <button
                        onClick={() =>
                          setCourseForm({ ...courseForm, imageurl: "" })
                        }
                        className="flex items-center justify-center gap-2 text-main font-black text-[11px] uppercase tracking-widest mt-4 hover:text-primary transition-colors"
                      >
                        <X size={16} /> Default
                      </button>
                    </div>

                    <div className="w-2/3 flex flex-col">
                      <h4 className="text-[11px] font-black uppercase text-main tracking-widest mb-4">
                        Preview
                      </h4>
                      <div className="flex-grow border border-glass-border rounded-3xl overflow-hidden bg-background relative flex items-center justify-center shadow-lg group">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-background to-background"></div>
                        {courseForm.imageurl ? (
                          <img
                            src={courseForm.imageurl}
                            className="w-full h-full object-cover absolute inset-0 z-10"
                          />
                        ) : (
                          <div className="text-center opacity-70 z-10 p-10 bg-surface/50 backdrop-blur-md rounded-2xl border border-glass-border shadow-2xl transform rotate-3 transition-transform group-hover:rotate-0">
                            <div className="w-64 h-40 bg-gradient-to-tr from-primary/30 to-blue-400/10 rounded-xl mx-auto mb-6 flex flex-col items-center justify-center border border-white/10 shadow-inner">
                              <Camera
                                size={32}
                                className="text-primary/50 mb-2"
                              />
                              <span className="text-primary font-black text-[10px] tracking-widest uppercase">
                                Course Cover
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-8 pt-10 border-t border-glass-border">
                    <button
                      onClick={() => setCourseStep(2)}
                      className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-surface border border-glass-border text-muted hover:text-main hover:bg-white/5 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCourseStep(4)}
                      disabled={loading}
                      className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                    >
                      Next: Course Content
                    </button>
                  </div>
                </div>
              )}

              {courseStep === 4 && (
                <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <LayoutGrid size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-main uppercase italic">
                          Course Content Builder
                        </h3>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">
                          Structure your course with topics and activities
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setCourseStep(5)}
                      className="px-10 py-4 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all flex items-center gap-3"
                    >
                      Next: Enroll Participants <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex gap-8 items-start">
                    <div className="w-[320px] bg-surface/80 backdrop-blur-xl border border-glass-border rounded-[32px] p-6 shadow-xl flex-shrink-0 sticky top-24">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-black italic text-main text-sm truncate pr-4">
                          {courseForm.fullname}
                        </h4>
                        <button className="p-2 border border-glass-border rounded-lg text-muted">
                          <BookOpen size={12} />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {courseTopics.map((topic, tidx) => (
                          <div key={topic.id} className="mb-6">
                            <h4
                              className={`text-[12px] font-black uppercase tracking-widest pl-7 flex items-center justify-between group cursor-pointer transition-colors ${activeTopicId === topic.id ? "text-primary" : "text-muted hover:text-white"}`}
                              onClick={() => setActiveTopicId(topic.id)}
                            >
                              <div className="flex items-center gap-3">
                                {topic.name}
                              </div>
                              <ChevronDown size={14} />
                            </h4>
                            <div className="space-y-3 mt-4 relative">
                              <div className="absolute -left-[19px] top-4 bottom-8 w-px bg-glass-border"></div>

                              {topic.activities.length > 0 ? (
                                topic.activities.map((act) => (
                                  <div
                                    key={act.id}
                                    className="relative pl-7 group"
                                  >
                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-px bg-glass-border"></div>
                                    <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-primary bg-background shadow-[0_0_8px_rgba(var(--primary),0.8)] z-10"></div>
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-glass-border group-hover:border-primary/50 transition-colors shadow-sm">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                          {act.type === "video" ? (
                                            <Play size={14} />
                                          ) : (
                                            <BookOpen size={14} />
                                          )}
                                        </div>
                                        <span className="text-[10px] font-black tracking-widest text-main truncate max-w-[120px]">
                                          {act.name}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest pl-7 italic opacity-50">
                                  Empty topic
                                </p>
                              )}

                              <button
                                onClick={() => {
                                  setActiveTopicId(topic.id);
                                  setShowActivityModal(true);
                                }}
                                className="ml-7 mt-2 py-2 px-4 bg-primary/5 text-primary border border-primary/20 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all inline-flex items-center gap-2"
                              >
                                <Plus size={10} /> Add Activity
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Panel: Active View */}
                    <div className="flex-grow min-w-0">
                      {activeCourseView === "dashboard" ? (
                        <div className="bg-surface border border-glass-border rounded-[32px] p-12 text-center space-y-6 shadow-xl">
                          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
                            <LayoutGrid size={40} />
                          </div>
                          <h3 className="text-2xl font-black text-main uppercase italic">
                            Topic {activeTopicId} Content
                          </h3>
                          <p className="text-muted text-sm max-w-md mx-auto leading-relaxed">
                            Add activities and materials to this section using
                            the button in the sidebar.
                          </p>

                          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <div
                              className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full"
                              onClick={() => {
                                setSelectedActivity("video");
                                setActiveCourseView("add-activity");
                              }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Play size={18} />
                              </div>
                              <h4 className="text-xs font-black text-main uppercase">
                                Add Video
                              </h4>
                              <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">
                                Upload MP4 or Link URL
                              </p>
                            </div>
                            <div
                              className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full"
                              onClick={() => {
                                setSelectedActivity("pdf");
                                setActiveCourseView("add-activity");
                              }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <FileText size={18} />
                              </div>
                              <h4 className="text-xs font-black text-main uppercase">
                                PDF Uploader
                              </h4>
                              <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">
                                Upload PDF documents and manuals
                              </p>
                            </div>
                            <div
                              className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full relative overflow-hidden"
                              onClick={() => {
                                setSelectedActivity("quiz");
                                setActiveCourseView("add-activity");
                              }}
                            >
                              <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-[8px] font-black uppercase tracking-widest">
                                AI Powered
                              </div>
                              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BrainCircuit size={18} />
                              </div>
                              <h4 className="text-xs font-black text-main uppercase">
                                AI Quiz
                              </h4>
                              <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">
                                Auto-generate from topic content
                              </p>
                            </div>
                            <div
                              className="bg-white/5 border border-glass-border p-6 rounded-2xl text-left hover:border-primary transition-all cursor-pointer group flex flex-col h-full"
                              onClick={() => {
                                setSelectedActivity("assignment");
                                setActiveCourseView("add-activity");
                              }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PenTool size={18} />
                              </div>
                              <h4 className="text-xs font-black text-main uppercase">
                                Assignment
                              </h4>
                              <p className="text-[10px] text-muted mt-1 uppercase font-bold flex-grow">
                                Collect files or text submissions
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-surface border border-glass-border rounded-[32px] shadow-xl overflow-hidden min-w-0">
                          <div className="p-8 border-b border-glass-border flex items-center gap-4 bg-white/5">
                            <button
                              onClick={() => setActiveCourseView("dashboard")}
                              className="p-2 bg-background hover:bg-white/10 rounded-xl border border-glass-border transition-all"
                            >
                              <ChevronRight size={18} className="rotate-180" />
                            </button>
                            <div>
                              <h3 className="text-xl font-black text-main uppercase italic">
                                Adding {selectedActivity} to{" "}
                                {
                                  courseTopics.find(
                                    (t) => t.id === activeTopicId,
                                  )?.name
                                }
                              </h3>
                              <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">
                                Configure your content details below
                              </p>
                            </div>
                          </div>
                          <div className="p-10 space-y-12 pb-32">
                            {/* General Section */}
                            <div className="space-y-6">
                              <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">
                                General
                              </h4>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase text-muted tracking-widest">
                                    Activity Name{" "}
                                    <span className="text-red-500 text-lg leading-none">
                                      *
                                    </span>
                                  </span>
                                  <Info size={10} className="text-muted/50" />
                                </div>
                                <input
                                  type="text"
                                  value={
                                    selectedActivity === "pdf"
                                      ? pdfActivityForm.name
                                      : videoActivityForm.name
                                  }
                                  onChange={(e) =>
                                    selectedActivity === "pdf"
                                      ? setPdfActivityForm({
                                          ...pdfActivityForm,
                                          name: e.target.value,
                                        })
                                      : setVideoActivityForm({
                                          ...videoActivityForm,
                                          name: e.target.value,
                                        })
                                  }
                                  className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner"
                                  placeholder={`Enter activity name...`}
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase text-muted tracking-widest">
                                    Description (optional)
                                  </span>
                                  <Info size={10} className="text-muted/50" />
                                </div>
                                <div className="border border-glass-border rounded-[24px] bg-background/50 overflow-hidden shadow-inner focus-within:border-primary/50 transition-colors">
                                  <div className="flex items-center gap-2 p-4 bg-surface border-b border-glass-border flex-wrap">
                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                                        <Type size={14} />
                                      </button>
                                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-serif font-black">
                                        A
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-bold text-sm">
                                        B
                                      </button>
                                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors italic text-sm">
                                        I
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                                      <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                                        <List size={14} />
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={
                                      selectedActivity === "pdf"
                                        ? pdfActivityForm.description
                                        : videoActivityForm.description
                                    }
                                    onChange={(e) =>
                                      selectedActivity === "pdf"
                                        ? setPdfActivityForm({
                                            ...pdfActivityForm,
                                            description: e.target.value,
                                          })
                                        : setVideoActivityForm({
                                            ...videoActivityForm,
                                            description: e.target.value,
                                          })
                                    }
                                    className="w-full h-40 bg-transparent p-6 text-xs font-bold outline-none resize-none custom-scrollbar"
                                    placeholder="Enter activity description..."
                                  />
                                </div>
                              </div>
                              <label className="flex items-center gap-4 group cursor-pointer w-max">
                                <div
                                  onClick={() =>
                                    selectedActivity === "pdf"
                                      ? setPdfActivityForm({
                                          ...pdfActivityForm,
                                          displayDescription:
                                            !pdfActivityForm.displayDescription,
                                        })
                                      : setVideoActivityForm({
                                          ...videoActivityForm,
                                          displayDescription:
                                            !videoActivityForm.displayDescription,
                                        })
                                  }
                                  className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === "pdf" ? pdfActivityForm.displayDescription : videoActivityForm.displayDescription) ? "bg-primary border-primary" : "border-glass-border group-hover:border-primary"}`}
                                >
                                  {(selectedActivity === "pdf"
                                    ? pdfActivityForm.displayDescription
                                    : videoActivityForm.displayDescription) && (
                                    <Plus
                                      size={14}
                                      className="text-white rotate-45"
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">
                                  Display description on course page
                                </span>
                              </label>

                              {selectedActivity === "pdf" && (
                                <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black uppercase text-muted tracking-widest">
                                        Display folder contents
                                      </span>
                                      <Info
                                        size={10}
                                        className="text-muted/50"
                                      />
                                    </div>
                                    <select
                                      value={pdfActivityForm.displayContents}
                                      onChange={(e) =>
                                        setPdfActivityForm({
                                          ...pdfActivityForm,
                                          displayContents: e.target.value,
                                        })
                                      }
                                      className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner appearance-none"
                                    >
                                      <option value="separate">
                                        On a separate page
                                      </option>
                                      <option value="inline">
                                        Inline on course page
                                      </option>
                                    </select>
                                  </div>
                                  <div className="space-y-4">
                                    <label className="flex items-center gap-4 group cursor-pointer w-max">
                                      <div
                                        onClick={() =>
                                          setPdfActivityForm({
                                            ...pdfActivityForm,
                                            showSubfolders:
                                              !pdfActivityForm.showSubfolders,
                                          })
                                        }
                                        className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${pdfActivityForm.showSubfolders ? "bg-primary border-primary" : "border-glass-border group-hover:border-primary"}`}
                                      >
                                        {pdfActivityForm.showSubfolders && (
                                          <Plus
                                            size={14}
                                            className="text-white rotate-45"
                                          />
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">
                                        Show sub-folders expanded
                                      </span>
                                    </label>
                                    <label className="flex items-center gap-4 group cursor-pointer w-max">
                                      <div
                                        onClick={() =>
                                          setPdfActivityForm({
                                            ...pdfActivityForm,
                                            openInNewTab:
                                              !pdfActivityForm.openInNewTab,
                                          })
                                        }
                                        className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${pdfActivityForm.openInNewTab ? "bg-primary border-primary" : "border-glass-border group-hover:border-primary"}`}
                                      >
                                        {pdfActivityForm.openInNewTab && (
                                          <Plus
                                            size={14}
                                            className="text-white rotate-45"
                                          />
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold text-main/80 uppercase tracking-widest">
                                        Open PDFs in new tabs/windows
                                      </span>
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* PDF Section */}
                            {selectedActivity === "pdf" && (
                              <div className="space-y-6">
                                <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">
                                  PDF
                                </h4>
                                <div className="space-y-4">
                                  <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1">
                                    <span className="text-red-500">*</span> PDFs{" "}
                                    <Info
                                      size={12}
                                      className="inline text-muted/50"
                                    />
                                  </label>
                                  <div
                                    onClick={() =>
                                      activityFileInputRef.current?.click()
                                    }
                                    className="w-full h-64 border-2 border-dashed border-glass-border bg-background/30 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                  >
                                    <input
                                      type="file"
                                      ref={activityFileInputRef}
                                      className="hidden"
                                      accept="application/pdf"
                                      onChange={(e) =>
                                        handleActivityFileUpload(e, "pdfUrl")
                                      }
                                    />
                                    {pdfActivityForm.pdfUrl ? (
                                      <div className="text-center p-6">
                                        <div className="p-4 bg-primary/10 rounded-2xl mb-4 inline-block">
                                          <FileText
                                            size={32}
                                            className="text-primary"
                                          />
                                        </div>
                                        <p className="text-xs font-black text-main uppercase">
                                          PDF Uploaded Successfully
                                        </p>
                                        <p className="text-[10px] text-muted mt-1 truncate max-w-xs">
                                          {pdfActivityForm.pdfUrl}
                                        </p>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPdfActivityForm({
                                              ...pdfActivityForm,
                                              pdfUrl: "",
                                            });
                                          }}
                                          className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                        >
                                          Remove File
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="p-5 bg-surface rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                          <UploadCloud
                                            size={32}
                                            className="text-primary"
                                          />
                                        </div>
                                        <div className="text-center">
                                          <span className="text-sm font-black text-main">
                                            Drag and drop PDF here, or click to{" "}
                                            <span className="text-primary hover:underline">
                                              browse
                                            </span>
                                          </span>
                                          <p className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest opacity-60">
                                            File Format: PDF Only
                                          </p>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Video Section */}
                            {selectedActivity === "video" && (
                              <div className="space-y-6">
                                <h4 className="text-[12px] font-black uppercase text-main tracking-widest border-l-4 border-primary pl-4">
                                  Video
                                </h4>
                                <div className="flex bg-background/50 border border-glass-border rounded-2xl w-full max-w-2xl overflow-hidden p-1.5 shadow-inner">
                                  <button
                                    onClick={() =>
                                      setVideoActivityForm({
                                        ...videoActivityForm,
                                        videoType: "upload",
                                      })
                                    }
                                    className={`flex-1 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${videoActivityForm.videoType === "upload" ? "bg-surface text-primary shadow-lg border border-glass-border" : "text-muted hover:text-main"}`}
                                  >
                                    <UploadCloud size={16} /> Upload File
                                  </button>
                                  <button
                                    onClick={() =>
                                      setVideoActivityForm({
                                        ...videoActivityForm,
                                        videoType: "link",
                                      })
                                    }
                                    className={`flex-1 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${videoActivityForm.videoType === "link" ? "bg-surface text-primary shadow-lg border border-glass-border" : "text-muted hover:text-main"}`}
                                  >
                                    <Link size={16} /> Video Link
                                  </button>
                                </div>

                                {videoActivityForm.videoType === "upload" ? (
                                  <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1">
                                      <span className="text-red-500">*</span>{" "}
                                      Video file{" "}
                                      <Info
                                        size={12}
                                        className="inline text-muted/50"
                                      />
                                    </label>
                                    <div
                                      onClick={() =>
                                        activityFileInputRef.current?.click()
                                      }
                                      className="w-full h-64 border-2 border-dashed border-glass-border bg-background/30 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                    >
                                      <input
                                        type="file"
                                        ref={activityFileInputRef}
                                        className="hidden"
                                        accept="video/*"
                                        onChange={(e) =>
                                          handleActivityFileUpload(
                                            e,
                                            "videoUrl",
                                          )
                                        }
                                      />
                                      {videoActivityForm.videoUrl &&
                                      videoActivityForm.videoUrl.includes(
                                        "uploads/",
                                      ) ? (
                                        <div className="text-center p-6">
                                          <div className="p-4 bg-primary/10 rounded-2xl mb-4 inline-block">
                                            <Video
                                              size={32}
                                              className="text-primary"
                                            />
                                          </div>
                                          <p className="text-xs font-black text-main uppercase">
                                            Video Uploaded Successfully
                                          </p>
                                          <p className="text-[10px] text-muted mt-1 truncate max-w-xs">
                                            {videoActivityForm.videoUrl}
                                          </p>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setVideoActivityForm({
                                                ...videoActivityForm,
                                                videoUrl: "",
                                              });
                                            }}
                                            className="mt-4 text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline"
                                          >
                                            Remove File
                                          </button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="p-5 bg-surface rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                                            <UploadCloud
                                              size={32}
                                              className="text-primary"
                                            />
                                          </div>
                                          <div className="text-center">
                                            <span className="text-sm font-black text-main">
                                              Drag and drop video here, or click
                                              to{" "}
                                              <span className="text-primary hover:underline">
                                                browse
                                              </span>
                                            </span>
                                            <p className="text-[10px] font-bold text-muted mt-2 uppercase tracking-widest opacity-60">
                                              Supports MP4, MOV, AVI â€¢ Max
                                              file size: 500MB
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-main tracking-widest ml-1">
                                      <span className="text-red-500">*</span>{" "}
                                      Video URL{" "}
                                      <Info
                                        size={12}
                                        className="inline text-muted/50"
                                      />
                                    </label>
                                    <div className="relative">
                                      <Globe
                                        className="absolute left-6 top-1/2 -translate-y-1/2 text-muted"
                                        size={18}
                                      />
                                      <input
                                        type="text"
                                        value={videoActivityForm.videoUrl}
                                        onChange={(e) =>
                                          setVideoActivityForm({
                                            ...videoActivityForm,
                                            videoUrl: e.target.value,
                                          })
                                        }
                                        className="academy-input w-full h-16 bg-background/50 border border-glass-border px-16 text-xs font-bold focus:border-primary transition-all outline-none rounded-2xl shadow-inner"
                                        placeholder="Paste YouTube, Vimeo, or MP4 URL here..."
                                      />
                                    </div>
                                    <p className="text-red-500 text-[9px] font-black uppercase tracking-widest ml-2 opacity-80">
                                      Note: External videos may have
                                      platform-specific restrictions.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Advanced Settings */}
                            <div className="space-y-6 pt-10 border-t border-glass-border">
                              <div className="flex items-center gap-3">
                                <ChevronUp size={20} className="text-primary" />
                                <h4 className="text-[12px] font-black uppercase text-main tracking-[0.2em]">
                                  Advanced Settings
                                </h4>
                              </div>

                              <div className="space-y-4">
                                {/* Video Specific Settings */}
                                {selectedActivity === "video" && (
                                  <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                    <div
                                      onClick={() =>
                                        setActiveAdvancedSection(
                                          activeAdvancedSection === "video"
                                            ? ""
                                            : "video",
                                        )
                                      }
                                      className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === "video" ? "bg-primary/5" : "hover:bg-white/5"}`}
                                    >
                                      <span className="text-xs font-black uppercase tracking-widest text-main">
                                        Video Options
                                      </span>
                                      <ChevronDown
                                        size={18}
                                        className={`transition-transform duration-300 ${activeAdvancedSection === "video" ? "rotate-180" : ""}`}
                                      />
                                    </div>

                                    {activeAdvancedSection === "video" && (
                                      <div className="p-10 space-y-10 animate-in slide-in-from-top-4 duration-300">
                                        <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-main tracking-widest">
                                              Video player size
                                            </span>
                                            <Info
                                              size={12}
                                              className="text-muted/50"
                                            />
                                          </div>
                                          <div className="flex items-center gap-6">
                                            <div className="relative flex-1 max-w-[200px]">
                                              <input
                                                type="number"
                                                value={
                                                  videoActivityForm.playerSizeWidth
                                                }
                                                onChange={(e) =>
                                                  setVideoActivityForm({
                                                    ...videoActivityForm,
                                                    playerSizeWidth:
                                                      e.target.value,
                                                  })
                                                }
                                                className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl"
                                              />
                                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted uppercase">
                                                px
                                              </span>
                                            </div>
                                            <X
                                              size={14}
                                              className="text-muted opacity-40"
                                            />
                                            <div className="relative flex-1 max-w-[200px]">
                                              <input
                                                type="number"
                                                value={
                                                  videoActivityForm.playerSizeHeight
                                                }
                                                onChange={(e) =>
                                                  setVideoActivityForm({
                                                    ...videoActivityForm,
                                                    playerSizeHeight:
                                                      e.target.value,
                                                  })
                                                }
                                                className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl"
                                              />
                                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted uppercase">
                                                px
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-10">
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black uppercase text-main tracking-widest">
                                                Move forward
                                              </span>
                                              <Info
                                                size={12}
                                                className="text-muted/50"
                                              />
                                            </div>
                                            <CompactToggle
                                              label={
                                                videoActivityForm.moveForward
                                                  ? "Enabled"
                                                  : "Disabled"
                                              }
                                              checked={
                                                videoActivityForm.moveForward
                                              }
                                              onChange={(v) =>
                                                setVideoActivityForm({
                                                  ...videoActivityForm,
                                                  moveForward: v,
                                                })
                                              }
                                            />
                                          </div>
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-black uppercase text-main tracking-widest">
                                                Responsive
                                              </span>
                                              <Info
                                                size={12}
                                                className="text-muted/50"
                                              />
                                            </div>
                                            <CompactToggle
                                              label={
                                                videoActivityForm.responsive
                                                  ? "Enabled"
                                                  : "Disabled"
                                              }
                                              checked={
                                                videoActivityForm.responsive
                                              }
                                              onChange={(v) =>
                                                setVideoActivityForm({
                                                  ...videoActivityForm,
                                                  responsive: v,
                                                })
                                              }
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-main tracking-widest">
                                              Poster image
                                            </span>
                                            <Info
                                              size={12}
                                              className="text-muted/50"
                                            />
                                          </div>
                                          <input
                                            type="file"
                                            ref={posterImageInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) =>
                                              handleActivityFileUpload(
                                                e,
                                                "posterImageUrl",
                                              )
                                            }
                                          />
                                          <div
                                            onClick={() =>
                                              posterImageInputRef.current?.click()
                                            }
                                            className="w-full h-48 border-2 border-dashed border-glass-border bg-background/30 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-all cursor-pointer group shadow-inner relative overflow-hidden"
                                          >
                                            {videoActivityForm.posterImageUrl ? (
                                              <img
                                                src={
                                                  videoActivityForm.posterImageUrl
                                                }
                                                className="w-full h-full object-cover"
                                              />
                                            ) : (
                                              <>
                                                <UploadCloud
                                                  size={24}
                                                  className="text-muted group-hover:text-primary transition-colors"
                                                />
                                                <div className="text-center">
                                                  <p className="text-[11px] font-black text-main uppercase tracking-widest">
                                                    Drag and drop image here, or
                                                    click to{" "}
                                                    <span className="text-primary underline">
                                                      browse
                                                    </span>
                                                  </p>
                                                  <p className="text-[9px] font-bold text-muted mt-1 uppercase tracking-widest opacity-60">
                                                    Supports JPG, JPEG, PNG â€¢
                                                    Max file size: 5MB
                                                  </p>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-main tracking-widest">
                                              Captions
                                            </span>
                                            <Info
                                              size={12}
                                              className="text-muted/50"
                                            />
                                          </div>
                                          <div className="relative">
                                            <ScrollText
                                              className="absolute left-6 top-1/2 -translate-y-1/2 text-muted"
                                              size={18}
                                            />
                                            <input
                                              type="text"
                                              className="academy-input w-full h-14 bg-background/50 border border-glass-border px-16 text-xs font-bold focus:border-primary transition-all outline-none rounded-xl shadow-inner"
                                              placeholder="Upload or link VTT/SRT captions file..."
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Restrict Access Section */}
                                <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                  <div
                                    onClick={() =>
                                      setActiveAdvancedSection(
                                        activeAdvancedSection === "restrictions"
                                          ? ""
                                          : "restrictions",
                                      )
                                    }
                                    className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === "restrictions" ? "bg-primary/5" : "hover:bg-white/5"}`}
                                  >
                                    <span className="text-xs font-black uppercase tracking-widest text-main">
                                      Restrict Access
                                    </span>
                                    <ChevronDown
                                      size={18}
                                      className={`transition-transform duration-300 ${activeAdvancedSection === "restrictions" ? "rotate-180" : ""}`}
                                    />
                                  </div>

                                  {activeAdvancedSection === "restrictions" && (
                                    <div className="p-10 space-y-8 animate-in slide-in-from-top-4 duration-300">
                                      <div className="flex items-start gap-10">
                                        <span className="w-40 text-[10px] font-black uppercase text-muted tracking-widest pt-2">
                                          Access restrictions
                                        </span>
                                        <div className="flex-grow space-y-6">
                                          {(selectedActivity === "pdf"
                                            ? pdfActivityForm.restrictions
                                            : videoActivityForm.restrictions
                                          ).length > 0 ? (
                                            <div className="space-y-3">
                                              {(selectedActivity === "pdf"
                                                ? pdfActivityForm.restrictions
                                                : videoActivityForm.restrictions
                                              ).map((r, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center justify-between p-4 bg-background border border-glass-border rounded-xl"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                      <ShieldCheck size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-main uppercase tracking-widest">
                                                      {r.title}
                                                    </span>
                                                  </div>
                                                  <button
                                                    onClick={() => {
                                                      const newRestrictions = (
                                                        selectedActivity ===
                                                        "pdf"
                                                          ? pdfActivityForm.restrictions
                                                          : videoActivityForm.restrictions
                                                      ).filter(
                                                        (_, i) => i !== idx,
                                                      );
                                                      selectedActivity === "pdf"
                                                        ? setPdfActivityForm({
                                                            ...pdfActivityForm,
                                                            restrictions:
                                                              newRestrictions,
                                                          })
                                                        : setVideoActivityForm({
                                                            ...videoActivityForm,
                                                            restrictions:
                                                              newRestrictions,
                                                          });
                                                    }}
                                                    className="text-red-500 hover:text-red-600 p-2"
                                                  >
                                                    <X size={14} />
                                                  </button>
                                                </div>
                                              ))}
                                              <button
                                                onClick={() =>
                                                  setShowRestrictionModal(true)
                                                }
                                                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline mt-2"
                                              >
                                                + Add another restriction
                                              </button>
                                            </div>
                                          ) : (
                                            <div className="p-6 bg-background/50 border border-glass-border rounded-2xl border-dashed flex flex-col items-center justify-center gap-3">
                                              <span className="text-xs font-bold text-muted italic">
                                                No restrictions added yet
                                              </span>
                                              <button
                                                onClick={() =>
                                                  setShowRestrictionModal(true)
                                                }
                                                className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                                              >
                                                Add restriction...
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Activity Completion Section */}
                                <div className="border border-glass-border rounded-[32px] overflow-hidden bg-surface shadow-xl">
                                  <div
                                    onClick={() =>
                                      setActiveAdvancedSection(
                                        activeAdvancedSection === "completion"
                                          ? ""
                                          : "completion",
                                      )
                                    }
                                    className={`p-6 flex items-center justify-between cursor-pointer transition-colors ${activeAdvancedSection === "completion" ? "bg-primary/5" : "hover:bg-white/5"}`}
                                  >
                                    <span className="text-xs font-black uppercase tracking-widest text-main">
                                      Activity Completion
                                    </span>
                                    <ChevronDown
                                      size={18}
                                      className={`transition-transform duration-300 ${activeAdvancedSection === "completion" ? "rotate-180" : ""}`}
                                    />
                                  </div>

                                  {activeAdvancedSection === "completion" && (
                                    <div className="p-10 space-y-10 animate-in slide-in-from-top-4 duration-300">
                                      <div className="flex items-center gap-10">
                                        <div className="w-48 flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase text-muted tracking-widest">
                                            Completion tracking
                                          </span>
                                          <Info
                                            size={12}
                                            className="text-muted/50"
                                          />
                                        </div>
                                        <div className="relative flex-grow max-w-xl">
                                          <select
                                            value={
                                              selectedActivity === "pdf"
                                                ? pdfActivityForm.completionTracking
                                                : videoActivityForm.completionTracking
                                            }
                                            onChange={(e) =>
                                              selectedActivity === "pdf"
                                                ? setPdfActivityForm({
                                                    ...pdfActivityForm,
                                                    completionTracking:
                                                      e.target.value,
                                                  })
                                                : setVideoActivityForm({
                                                    ...videoActivityForm,
                                                    completionTracking:
                                                      e.target.value,
                                                  })
                                            }
                                            className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-xl shadow-inner"
                                          >
                                            <option value="none">
                                              Do not indicate activity
                                              completion
                                            </option>
                                            <option value="manual">
                                              Students can manually mark the
                                              activity as completed
                                            </option>
                                            <option value="conditions">
                                              Show activity as complete when
                                              conditions are met
                                            </option>
                                          </select>
                                          <ChevronDown
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                                            size={16}
                                          />
                                        </div>
                                      </div>

                                      {(selectedActivity === "pdf"
                                        ? pdfActivityForm.completionTracking
                                        : videoActivityForm.completionTracking) ===
                                        "conditions" && (
                                        <div className="flex items-center gap-10 pl-10 border-l-2 border-primary/20">
                                          <span className="w-40 text-[10px] font-black uppercase text-muted tracking-widest">
                                            Require View
                                          </span>
                                          <label className="flex items-center gap-4 group cursor-pointer w-max">
                                            <div
                                              onClick={() =>
                                                selectedActivity === "pdf"
                                                  ? setPdfActivityForm({
                                                      ...pdfActivityForm,
                                                      requireView:
                                                        !pdfActivityForm.requireView,
                                                    })
                                                  : setVideoActivityForm({
                                                      ...videoActivityForm,
                                                      requireView:
                                                        !videoActivityForm.requireView,
                                                    })
                                              }
                                              className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === "pdf" ? pdfActivityForm.requireView : videoActivityForm.requireView) ? "bg-primary border-primary" : "border-glass-border group-hover:border-primary"}`}
                                            >
                                              {(selectedActivity === "pdf"
                                                ? pdfActivityForm.requireView
                                                : videoActivityForm.requireView) && (
                                                <Plus
                                                  size={14}
                                                  className="text-white rotate-45"
                                                />
                                              )}
                                            </div>
                                            <span className="text-xs font-black text-main/80 uppercase tracking-widest">
                                              Student must view this activity to
                                              complete it
                                            </span>
                                          </label>
                                        </div>
                                      )}

                                      <div className="flex items-center gap-10">
                                        <div className="w-48 flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase text-muted tracking-widest">
                                            Course completion
                                          </span>
                                          <Info
                                            size={12}
                                            className="text-muted/50"
                                          />
                                        </div>
                                        <label className="flex items-center gap-4 group cursor-pointer w-max">
                                          <div
                                            onClick={() =>
                                              selectedActivity === "pdf"
                                                ? setPdfActivityForm({
                                                    ...pdfActivityForm,
                                                    courseCompletion:
                                                      !pdfActivityForm.courseCompletion,
                                                  })
                                                : setVideoActivityForm({
                                                    ...videoActivityForm,
                                                    courseCompletion:
                                                      !videoActivityForm.courseCompletion,
                                                  })
                                            }
                                            className={`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${(selectedActivity === "pdf" ? pdfActivityForm.courseCompletion : videoActivityForm.courseCompletion) ? "bg-primary border-primary" : "border-glass-border group-hover:border-primary"}`}
                                          >
                                            {(selectedActivity === "pdf"
                                              ? pdfActivityForm.courseCompletion
                                              : videoActivityForm.courseCompletion) && (
                                              <Plus
                                                size={14}
                                                className="text-white rotate-45"
                                              />
                                            )}
                                          </div>
                                          <span className="text-xs font-black text-main/80 uppercase tracking-widest">
                                            Must be completed to complete course
                                          </span>
                                        </label>
                                      </div>

                                      <div className="flex items-center gap-10">
                                        <div className="w-48 flex items-center gap-2">
                                          <span className="text-[10px] font-black uppercase text-muted tracking-widest">
                                            Set completion date
                                          </span>
                                          <Info
                                            size={12}
                                            className="text-muted/50"
                                          />
                                        </div>
                                        <div className="flex items-center gap-6">
                                          <CompactToggle
                                            label={
                                              (
                                                selectedActivity === "pdf"
                                                  ? pdfActivityForm.completionDateEnabled
                                                  : videoActivityForm.completionDateEnabled
                                              )
                                                ? "Enabled"
                                                : "Disabled"
                                            }
                                            checked={
                                              selectedActivity === "pdf"
                                                ? pdfActivityForm.completionDateEnabled
                                                : videoActivityForm.completionDateEnabled
                                            }
                                            onChange={(v) =>
                                              selectedActivity === "pdf"
                                                ? setPdfActivityForm({
                                                    ...pdfActivityForm,
                                                    completionDateEnabled: v,
                                                  })
                                                : setVideoActivityForm({
                                                    ...videoActivityForm,
                                                    completionDateEnabled: v,
                                                  })
                                            }
                                          />
                                          {(selectedActivity === "pdf"
                                            ? pdfActivityForm.completionDateEnabled
                                            : videoActivityForm.completionDateEnabled) && (
                                            <input
                                              type="datetime-local"
                                              value={
                                                selectedActivity === "pdf"
                                                  ? pdfActivityForm.completionDate
                                                  : videoActivityForm.completionDate
                                              }
                                              onChange={(e) =>
                                                selectedActivity === "pdf"
                                                  ? setPdfActivityForm({
                                                      ...pdfActivityForm,
                                                      completionDate:
                                                        e.target.value,
                                                    })
                                                  : setVideoActivityForm({
                                                      ...videoActivityForm,
                                                      completionDate:
                                                        e.target.value,
                                                    })
                                              }
                                              className="academy-input bg-background/50 border border-glass-border px-6 py-3 text-xs font-black uppercase rounded-xl outline-none focus:border-primary transition-all shadow-inner"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="fixed bottom-0 right-0 left-[384px] p-6 bg-background/80 backdrop-blur-xl border-t border-glass-border flex gap-4 z-[50] justify-end">
                            <button
                              onClick={handleSaveActivity}
                              disabled={
                                loading ||
                                !(selectedActivity === "pdf"
                                  ? pdfActivityForm.name
                                  : videoActivityForm.name)
                              }
                              className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                              {loading && (
                                <Loader2 size={14} className="animate-spin" />
                              )}
                              Save & Enroll User
                            </button>
                            <button
                              onClick={handleSaveActivity}
                              disabled={
                                loading ||
                                !(selectedActivity === "pdf"
                                  ? pdfActivityForm.name
                                  : videoActivityForm.name)
                              }
                              className="px-10 py-4 bg-surface border border-glass-border text-main rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                              Save And Display
                            </button>
                            <button
                              onClick={() => setActiveCourseView("dashboard")}
                              className="px-10 py-4 bg-white/5 text-muted rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-main transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {courseStep === 5 && (
                <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <UserPlus size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-main uppercase italic">
                          Enroll Participants
                        </h3>
                        <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">
                          Select users to give them access to this course
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-glass-border rounded-[32px] p-10 shadow-xl space-y-8">
                    <div className="flex justify-between items-center gap-6">
                      <div className="relative flex-grow">
                        <Search
                          className="absolute left-6 top-1/2 -translate-y-1/2 text-muted"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search users to enroll..."
                          className="academy-input w-full pl-14 h-14 bg-background/50 border border-glass-border rounded-2xl text-xs font-bold focus:border-primary transition-all outline-none"
                          onChange={(e) => setSearchQuery(e.target.value)}
                          value={searchQuery}
                        />
                      </div>
                      <div className="text-[10px] font-black uppercase text-muted tracking-widest bg-background/50 px-6 py-4 rounded-2xl border border-glass-border whitespace-nowrap">
                        Total Users:{" "}
                        <span className="text-primary">
                          {data.users.length}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-main tracking-widest">
                          Quick Select Groups
                        </span>
                        <Info size={12} className="text-muted/50" />
                      </div>
                      <div className="flex gap-4">
                        {[
                          {
                            id: 5,
                            name: "Students",
                            icon: <Users size={16} />,
                            color: "bg-blue-500",
                          },
                          {
                            id: 3,
                            name: "Teachers",
                            icon: <ShieldCheck size={16} />,
                            color: "bg-orange-500",
                          },
                        ].map((group) => (
                          <button
                            key={group.id}
                            onClick={() => {
                              const usersInGroup = data.users.filter((u) => {
                                const assignment = data.systemAssignments?.find(
                                  (a) => parseInt(a.userid) === parseInt(u.id),
                                );
                                const roleId = assignment
                                  ? parseInt(assignment.roleid)
                                  : 5; // Default to student
                                return roleId === group.id;
                              });
                              const ids = usersInGroup.map((u) => u.id);
                              const newEnrolledIds = [
                                ...new Set([...enrolledUserIds, ...ids]),
                              ];
                              setEnrolledUserIds(newEnrolledIds);

                              const newRoles = { ...enrolledRoles };
                              ids.forEach((id) => {
                                newRoles[id] = group.id;
                              });
                              setEnrolledRoles(newRoles);

                              alert(
                                `Selected all ${group.name} and assigned ${group.name} roles`,
                              );
                            }}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-glass-border rounded-2xl hover:border-primary transition-all group"
                          >
                            <div
                              className={`w-8 h-8 rounded-xl ${group.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}
                            >
                              {group.icon}
                            </div>
                            <span className="text-[10px] font-black uppercase text-main tracking-widest">
                              {group.name}
                            </span>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setEnrolledUserIds([]);
                            setEnrolledRoles({});
                          }}
                          className="px-6 py-3 text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline ml-auto"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                      {data.users
                        .filter(
                          (u) =>
                            u.fullname
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            u.email
                              ?.toLowerCase()
                              .includes(searchQuery.toLowerCase()),
                        )
                        .map((u) => (
                          <div
                            key={u.id}
                            className={`p-6 rounded-3xl border transition-all flex items-center justify-between ${enrolledUserIds.includes(u.id) ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" : "bg-background border-glass-border hover:border-primary/50"}`}
                          >
                            <div
                              className="flex items-center gap-4 cursor-pointer flex-grow"
                              onClick={() => {
                                if (enrolledUserIds.includes(u.id)) {
                                  setEnrolledUserIds(
                                    enrolledUserIds.filter((id) => id !== u.id),
                                  );
                                } else {
                                  setEnrolledUserIds([
                                    ...enrolledUserIds,
                                    u.id,
                                  ]);
                                  if (!enrolledRoles[u.id])
                                    setEnrolledRoles({
                                      ...enrolledRoles,
                                      [u.id]: 5,
                                    });
                                }
                              }}
                            >
                              <div className="w-10 h-10 rounded-full bg-surface border border-glass-border flex items-center justify-center font-black text-primary">
                                {u.fullname?.[0] || "U"}
                              </div>
                              <div>
                                <p className="text-xs font-black text-main uppercase tracking-widest">
                                  {u.fullname}
                                </p>
                                <p className="text-[10px] text-muted font-bold">
                                  {u.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div
                                onClick={() => {
                                  if (enrolledUserIds.includes(u.id)) {
                                    setEnrolledUserIds(
                                      enrolledUserIds.filter(
                                        (id) => id !== u.id,
                                      ),
                                    );
                                  } else {
                                    setEnrolledUserIds([
                                      ...enrolledUserIds,
                                      u.id,
                                    ]);
                                    if (!enrolledRoles[u.id])
                                      setEnrolledRoles({
                                        ...enrolledRoles,
                                        [u.id]: 5,
                                      });
                                  }
                                }}
                                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${enrolledUserIds.includes(u.id) ? "bg-primary border-primary text-white shadow-lg" : "border-glass-border"}`}
                              >
                                {enrolledUserIds.includes(u.id) && (
                                  <Check size={18} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-glass-border">
                      <div className="text-[10px] font-black uppercase text-muted tracking-widest">
                        Selected:{" "}
                        <span className="text-primary">
                          {enrolledUserIds.length} users
                        </span>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setCourseStep(4)}
                          className="px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-background border border-glass-border text-muted hover:text-main"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setCourseStep(6)}
                          className="px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105"
                        >
                          Next: Review & Publish
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {courseStep === 6 && (
                <div className="animate-in slide-in-from-bottom-5 duration-700 fade-in pb-20">
                  <div className="bg-surface border border-glass-border rounded-[32px] overflow-hidden shadow-2xl">
                    <div className="h-64 bg-primary relative">
                      {courseForm.imageurl ? (
                        <img
                          src={courseForm.imageurl}
                          className="w-full h-full object-cover opacity-60"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                      <div className="absolute bottom-10 left-10">
                        <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-white/10">
                          Final Review
                        </span>
                        <h2 className="text-4xl font-black text-white italic tracking-tight">
                          {courseForm.fullname}
                        </h2>
                      </div>
                    </div>

                    <div className="p-10 space-y-10">
                      <div className="grid grid-cols-3 gap-8">
                        <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                          <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">
                            Structure
                          </p>
                          <p className="text-lg font-black text-main">
                            {courseTopics.length} Topics
                          </p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                          <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">
                            Content
                          </p>
                          <p className="text-lg font-black text-main">
                            {courseTopics.reduce(
                              (acc, t) => acc + t.activities.length,
                              0,
                            )}{" "}
                            Activities
                          </p>
                        </div>
                        <div className="bg-background/50 p-6 rounded-3xl border border-glass-border">
                          <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-2">
                            Participants
                          </p>
                          <p className="text-lg font-black text-main">
                            {enrolledUserIds.length} Enrolled
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-6 pt-10 border-t border-glass-border">
                        <button
                          onClick={() => setCourseStep(5)}
                          className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-background border border-glass-border text-muted hover:text-main"
                        >
                          Back to Enrollment
                        </button>
                        <button
                          onClick={handlePublishCourse}
                          disabled={loading}
                          className="px-12 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 flex items-center gap-4"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Sparkles size={18} />
                          )}
                          Publish Course to Moodle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {subTab === "Categories" && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
              <div className="bg-surface border border-glass-border rounded-3xl p-10 shadow-xl space-y-8">
                <div className="flex items-center justify-between border-b border-glass-border pb-6">
                  <div>
                    <h3 className="text-2xl font-black text-main italic uppercase tracking-tight">
                      Add A Category
                    </h3>
                    <p className="text-muted text-[10px] uppercase tracking-widest font-bold mt-1">
                      Create a new organizational category for your courses.
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                    <Tag size={24} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Info size={14} className="text-primary" />
                      <span className="text-[9px] font-black uppercase text-muted tracking-widest">
                        Parent Category
                      </span>
                    </div>
                    <div className="relative">
                      <select
                        value={categoryForm.parent}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            parent: e.target.value,
                          })
                        }
                        className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none rounded-2xl"
                      >
                        <option value="0">Default</option>
                        {data.categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  <CompactInput
                    label="Category Name"
                    req
                    value={categoryForm.name}
                    onChange={(v) =>
                      setCategoryForm({ ...categoryForm, name: v })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CompactInput
                    label="Category ID Number"
                    value={categoryForm.idnumber}
                    onChange={(v) =>
                      setCategoryForm({ ...categoryForm, idnumber: v })
                    }
                    icon={<Info size={14} className="text-primary" />}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase text-muted tracking-widest flex items-center gap-2">
                    Description
                  </label>
                  <div className="border border-glass-border rounded-[24px] bg-background/50 overflow-hidden shadow-inner">
                    <div className="flex items-center gap-2 p-4 bg-surface border-b border-glass-border flex-wrap">
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                          <Type size={14} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-serif font-black">
                          A
                        </button>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors font-bold">
                          B
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors italic">
                          I
                        </button>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                          <List size={14} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                          <Link size={14} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                          <Image size={14} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-md transition-colors">
                          <Video size={14} />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full h-48 bg-transparent p-8 text-xs font-bold outline-none resize-none custom-scrollbar"
                      placeholder="Provide a description for this category..."
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-glass-border flex justify-end">
                  <button
                    onClick={handleCreateCategory}
                    disabled={loading || !categoryForm.name}
                    className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Plus size={16} />
                    )}
                    Create Category
                  </button>
                </div>
              </div>

              <div className="bg-surface border border-glass-border rounded-3xl overflow-hidden shadow-xl">
                <div className="p-8 border-b border-glass-border bg-white/5">
                  <h4 className="text-sm font-black italic uppercase tracking-wider">
                    Existing Categories
                  </h4>
                </div>
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-glass-border bg-white/5 uppercase text-[8px] font-black tracking-widest text-primary/60">
                      <th className="p-6">Category Name</th>
                      <th className="p-6">ID Number</th>
                      <th className="p-6">Course Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border font-bold">
                    {data.categories?.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-6">
                          <span className="text-main uppercase tracking-tighter">
                            {c.name}
                          </span>
                        </td>
                        <td className="p-6 text-muted uppercase">
                          {c.idnumber || "â€”"}
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[8px] uppercase">
                            {c.coursecount || 0} Courses
                          </span>
                        </td>
                      </tr>
                    ))}
                    {data.categories?.length === 0 && (
                      <tr>
                        <td
                          colSpan="3"
                          className="p-10 text-center text-muted uppercase text-[8px] tracking-widest"
                        >
                          No categories found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ENROLL USERS MODAL ── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEnrollModal(false)}
          />
          <div className="relative w-[520px] bg-surface rounded-2xl shadow-2xl p-8 border border-glass-border">
            <div className="flex items-center justify-between mb-6 border-b border-glass-border pb-4">
              <h3 className="text-lg font-black text-main">Enroll Users</h3>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 flex items-center justify-center border border-glass-border rounded-lg text-muted hover:text-red-500 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Role */}
              <div className="flex items-center gap-4">
                <label className="w-24 text-[11px] font-black uppercase text-muted tracking-widest shrink-0">
                  Role
                </label>
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <div className="relative flex-grow">
                  <select
                    value={modalRole}
                    onChange={(e) => setModalRole(parseInt(e.target.value, 10))}
                    className="w-full h-11 border-2 border-primary rounded-lg px-4 text-sm font-bold focus:outline-none appearance-none bg-background text-main"
                  >
                    {(data.roles?.length
                      ? data.roles
                      : [
                          { id: 5, name: "Student" },
                          { id: 3, name: "Teacher" },
                          { id: 1, name: "Manager" },
                        ]
                    ).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.shortname || `Role ${r.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              <p className="text-[11px] font-bold text-muted ml-28">
                You can select multiple courses using the Ctrl key.
              </p>

              {/* Courses */}
              <div className="flex items-start gap-4">
                <label className="w-24 text-[11px] font-black uppercase text-muted tracking-widest shrink-0 pt-3">
                  Courses
                </label>
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-3" />
                <div className="flex-grow relative">
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setShowCourseDropdown((v) => !v)}
                    className="w-full h-11 border border-glass-border rounded-lg px-4 text-sm font-bold bg-background text-main flex items-center justify-between focus:border-primary outline-none"
                  >
                    <span className="truncate text-xs">
                      {selectedCourseIds.length === 0
                        ? "Select courses…"
                        : `${selectedCourseIds.length} course${selectedCourseIds.length > 1 ? "s" : ""} selected`}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-muted transition-transform ${showCourseDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showCourseDropdown && (
                    <div
                     onMouseDown={(e) => e.nativeEvent.stopImmediatePropagation()}
                      className="absolute z-[80] mt-1 w-full bg-surface border border-glass-border rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar"
                    >
                      {(data.courses || []).map((c) => {
                        const checked = selectedCourseIds.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onMouseDown={(e) => e.nativeEvent.stopImmediatePropagation()}
                            onClick={() =>
                              setSelectedCourseIds((prev) =>
                                prev.includes(c.id)
                                  ? prev.filter((id) => id !== c.id)
                                  : [...prev, c.id],
                              )
                            }
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 cursor-pointer transition-colors select-none"
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                checked
                                  ? "bg-primary border-primary"
                                  : "border-glass-border"
                              }`}
                            >
                              {checked && (
                                <Check size={10} className="text-white" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-main truncate">
                              {c.fullname || c.shortname}
                            </span>
                          </div>
                        );
                      })}
                      {(data.courses || []).length === 0 && (
                        <p className="px-4 py-3 text-[10px] text-muted font-bold uppercase">
                          No courses available
                        </p>
                      )}
                    </div>
                  )}

                  {/* Selected course tags */}
                  {selectedCourseIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedCourseIds.map((id) => {
                        const c = data.courses.find((x) => x.id === id);
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black"
                          >
                            {c?.fullname || id}
                            <button
                              onClick={() =>
                                setSelectedCourseIds((prev) =>
                                  prev.filter((x) => x !== id),
                                )
                              }
                              className="hover:text-red-500 transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Date */}
              <div className="flex items-center gap-4">
                <label className="w-24 text-[11px] font-black uppercase text-muted tracking-widest shrink-0">
                  Start date
                </label>
                <div className="flex-grow flex items-center gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="flex-grow h-11 border border-glass-border rounded-lg px-3 text-sm font-bold focus:border-primary outline-none bg-background text-main"
                  />
                  <button className="p-2 border border-glass-border rounded-lg text-muted hover:text-primary transition-all">
                    <Calendar size={16} />
                  </button>
                  <button className="px-3 py-2 border border-glass-border rounded-lg text-[10px] font-black uppercase text-muted hover:text-primary transition-all">
                    Clear All
                  </button>
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center gap-4">
                <label className="w-24 text-[11px] font-black uppercase text-muted tracking-widest shrink-0">
                  End date
                </label>
                <div className="flex-grow flex items-center gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    className="flex-grow h-11 border border-glass-border rounded-lg px-3 text-sm font-bold focus:border-primary outline-none bg-background text-main"
                  />
                  <button className="p-2 border border-glass-border rounded-lg text-muted hover:text-primary transition-all">
                    <Calendar size={16} />
                  </button>
                  <button className="px-3 py-2 border border-glass-border rounded-lg text-[10px] font-black uppercase text-muted hover:text-primary transition-all">
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8 pt-4 border-t border-glass-border">
              <button
                onClick={handleEnrollUsers}
                className="px-10 py-3 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Enroll
              </button>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="px-10 py-3 rounded-xl border border-glass-border text-muted font-black text-[10px] uppercase tracking-widest hover:text-primary transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCohortModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-lg border border-glass-border rounded-3xl shadow-3xl p-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black italic uppercase text-main">
                Create Cohort
              </h3>
              <button
                onClick={() => setShowCohortModal(false)}
                className="p-2 rounded-xl border border-glass-border text-muted hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "Students",
                "Teachers",
                "Managers",
                "Compliance Department",
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleCreateCohort(preset)}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <CompactInput
                label="Cohort Name"
                value={cohortForm.name}
                onChange={(v) => setCohortForm({ ...cohortForm, name: v })}
                req
              />
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-muted tracking-widest">
                  Description
                </label>
                <textarea
                  value={cohortForm.description}
                  onChange={(e) =>
                    setCohortForm({
                      ...cohortForm,
                      description: e.target.value,
                    })
                  }
                  className="academy-input w-full h-24 bg-background/50 border border-glass-border p-4 text-xs font-bold focus:border-primary outline-none resize-none"
                  placeholder="Optional description for this group"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowCohortModal(false)}
                className="px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-muted border border-glass-border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateCohort()}
                className="bg-primary text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Create Cohort
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ HIGH-DENSITY PROFESSIONAL USER PORTAL â”€â”€ */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-5xl border border-glass-border rounded-3xl shadow-3xl flex h-[80vh] overflow-hidden">
            <div className="w-64 bg-surface-hover/30 border-r border-glass-border flex flex-col p-6">
              <div className="mb-8 text-primary">
                {showModal.includes("Course") ? (
                  <BookOpen size={32} />
                ) : (
                  <UserPlus size={32} />
                )}
              </div>
              <h3 className="text-lg font-black italic uppercase mb-6 text-main/90">
                {showModal}
              </h3>
              <nav className="space-y-1.5">
                {showModal === "Edit Course" ? (
                  <ModalNav
                    active={true}
                    icon={<ScrollText size={14} />}
                    label="General Info"
                    onClick={() => {}}
                  />
                ) : (
                  <>
                    <ModalNav
                      active={modalSection === "general"}
                      icon={<ScrollText size={14} />}
                      label="General"
                      onClick={() => setModalSection("general")}
                    />
                    <ModalNav
                      active={modalSection === "userpicture"}
                      icon={<Camera size={14} />}
                      label="User Picture"
                      onClick={() => setModalSection("userpicture")}
                    />
                    <ModalNav
                      active={modalSection === "optional"}
                      icon={<LayoutGrid size={14} />}
                      label="Institutional"
                      onClick={() => setModalSection("optional")}
                    />
                  </>
                )}
              </nav>
            </div>

            <div className="flex-grow flex flex-col min-w-0 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-6 top-6 p-2.5 bg-background border border-glass-border rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all z-10 focus:outline-none"
              >
                <X size={20} />
              </button>

              <div className="flex-grow overflow-y-auto p-10 custom-scrollbar">
                {showModal === "Edit Course" ? (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 gap-6 p-6 bg-background/30 rounded-2xl border border-glass-border">
                      <CompactInput
                        label="Course Fullname"
                        value={courseForm.fullname}
                        onChange={(v) =>
                          setCourseForm({ ...courseForm, fullname: v })
                        }
                        req
                      />
                      <CompactSelect
                        label="Category"
                        value={courseForm.categoryid}
                        options={[
                          { v: "", l: "Select Category" },
                          ...data.categories.map((c) => ({
                            v: c.id,
                            l: c.name,
                          })),
                        ]}
                        onChange={(v) =>
                          setCourseForm({ ...courseForm, categoryid: v })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-muted tracking-widest">
                        Course Summary
                      </label>
                      <textarea
                        value={courseForm.summary}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            summary: e.target.value,
                          })
                        }
                        className="academy-input w-full h-48 bg-background/50 border border-glass-border p-6 text-xs font-bold focus:border-primary transition-all outline-none resize-none"
                        placeholder="Describe what students will learn in this course"
                      />
                    </div>
                  </div>
                ) : (
                  modalSection === "general" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="grid grid-cols-3 gap-6 p-6 bg-background/30 rounded-2xl border border-glass-border">
                        <CompactInput
                          label="Username"
                          value={form.username}
                          onChange={(v) => setForm({ ...form, username: v })}
                          req
                        />
                        {/* <CompactSelect label="Auth Method" value={form.auth} options={[{v:'manual', l:'Manual accounts'}]} /> */}
                        <CompactInput
                          label="Password"
                          type="password"
                          value={form.password}
                          onChange={(v) => setForm({ ...form, password: v })}
                        />
                        <CompactSelect
                          label="System Role"
                          value={form.roleid}
                          options={[
                            { v: "", l: "None (Default)" },
                            ...data.roles.map((r) => ({ v: r.id, l: r.name })),
                          ]}
                          onChange={(v) => setForm({ ...form, roleid: v })}
                          icon={<ShieldCheck size={12} />}
                        />
                      </div>

                      <div className="flex items-center gap-8 bg-primary/5 p-5 rounded-xl border border-primary/10">
                        <CompactToggle
                          label="Suspended"
                          checked={form.suspended}
                          onChange={(v) => setForm({ ...form, suspended: v })}
                        />
                        <CompactToggle
                          label="Force Change"
                          checked={form.forcechange}
                          onChange={(v) => setForm({ ...form, forcechange: v })}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        <CompactInput
                          label="First name"
                          req
                          value={form.firstname}
                          onChange={(v) => setForm({ ...form, firstname: v })}
                        />
                        <CompactInput
                          label="Last name"
                          req
                          value={form.lastname}
                          onChange={(v) => setForm({ ...form, lastname: v })}
                        />
                        <CompactInput
                          label="Email address"
                          req
                          value={form.email}
                          onChange={(v) => setForm({ ...form, email: v })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <CompactInput
                          label="City"
                          value={form.city}
                          onChange={(v) => setForm({ ...form, city: v })}
                        />
                        <CompactSelect
                          label="Country"
                          value={form.country}
                          options={[
                            { v: "IN", l: "India" },
                            { v: "US", l: "USA" },
                          ]}
                          onChange={(v) => setForm({ ...form, country: v })}
                        />
                      </div>

                      {showModal === "Add User" && (
                        <div className="space-y-3 pt-2 border-t border-glass-border">
                          <label className="text-[9px] font-black uppercase text-muted tracking-widest flex items-center gap-2">
                            <Layers size={12} /> Cohort groups
                          </label>
                          {(data.cohorts || []).length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {(data.cohorts || []).map((c) => {
                                const selected = (
                                  form.cohortIds || []
                                ).includes(c.id);
                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => toggleFormCohort(c.id)}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${
                                      selected
                                        ? "bg-primary text-white border-primary"
                                        : "bg-surface border-glass-border text-muted hover:border-primary/40"
                                    }`}
                                  >
                                    {c.name}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] font-bold text-muted italic">
                              No cohorts available. Create cohorts under Cohort
                              Groups first.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {modalSection === "userpicture" && (
                  <div className="h-full flex flex-col justify-center items-center gap-10">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="w-56 h-56 rounded-[48px] border-4 border-dashed border-glass-border bg-white/5 flex flex-col items-center justify-center group hover:border-primary transition-all cursor-pointer overflow-hidden"
                    >
                      {form.profileimageurl ? (
                        <img
                          src={form.profileimageurl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <Camera
                            size={48}
                            className="text-muted group-hover:text-primary transition-colors"
                          />
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-6">
                            Upload Portrait
                          </p>
                        </>
                      )}
                    </div>
                    {form.profileimageurl && (
                      <button
                        onClick={() =>
                          setForm({ ...form, profileimageurl: "" })
                        }
                        className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline"
                      >
                        Remove Picture
                      </button>
                    )}
                  </div>
                )}

                {modalSection === "optional" && (
                  <div className="grid grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                    <CompactInput
                      label="ID number"
                      value={form.idnumber}
                      onChange={(v) => setForm({ ...form, idnumber: v })}
                      icon={<Lock size={12} />}
                    />
                    <CompactInput
                      label="Institution"
                      value={form.institution}
                      onChange={(v) => setForm({ ...form, institution: v })}
                      icon={<Building2 size={12} />}
                    />
                    <CompactInput
                      label="Department"
                      value={form.department}
                      onChange={(v) => setForm({ ...form, department: v })}
                      icon={<Tag size={12} />}
                    />
                    <CompactInput
                      label="Phone"
                      value={form.phone1}
                      onChange={(v) => setForm({ ...form, phone1: v })}
                      icon={<Phone size={12} />}
                    />
                    <CompactInput
                      label="Mobile"
                      value={form.phone2}
                      onChange={(v) => setForm({ ...form, phone2: v })}
                      icon={<Smartphone size={12} />}
                    />
                    <CompactInput
                      label="Address"
                      value={form.address}
                      onChange={(v) => setForm({ ...form, address: v })}
                      icon={<Home size={12} />}
                    />
                  </div>
                )}
              </div>

              <div className="p-10 border-t border-glass-border flex gap-6 bg-white/5 items-center justify-end px-12">
                <p className="mr-auto text-[9px] font-black text-primary uppercase tracking-[0.3em]">
                  Validation Status: Safe to Commit
                </p>
                <button
                  onClick={handleInitialize}
                  className="bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {" "}
                  {showModal === "Add User"
                    ? "Initialize account"
                    : "Update Record"}{" "}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-white/5 px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-widest text-muted hover:bg-glass-border transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface w-full max-w-4xl border border-glass-border rounded-3xl shadow-3xl overflow-hidden flex flex-col h-[70vh]">
            <div className="flex items-center justify-between p-6 border-b border-glass-border">
              <h3 className="text-lg font-black text-main">Add Activity</h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 text-muted hover:text-main rounded-xl hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 border-b border-glass-border">
              <div className="relative">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-muted"
                  size={16}
                />
                <input
                  className="w-full bg-background/50 border border-glass-border rounded-2xl pl-14 pr-6 py-4 text-xs outline-none font-bold placeholder-muted focus:border-primary transition-all"
                  placeholder="Search..."
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    name: "AI Activity Builder",
                    icon: <Activity />,
                    new: true,
                    id: "ai",
                  },
                  { name: "SCORM", icon: <Database />, id: "scorm" },
                  { name: "Quiz", icon: <CheckSquare />, id: "quiz" },
                  { name: "Video", icon: <Camera />, id: "video" },
                  { name: "Certificates", icon: <ShieldCheck />, id: "cert" },
                  {
                    name: "ILT (Instructor-Led Training)",
                    icon: <Users />,
                    id: "ilt",
                  },
                  { name: "Assignment", icon: <BookOpen />, id: "assign" },
                  { name: "Zoom meeting", icon: <Activity />, id: "zoom" },
                  {
                    name: "Microsoft Teams Meeting",
                    icon: <Users />,
                    id: "teams",
                  },
                  {
                    name: "AI Quiz Generator",
                    icon: <Activity />,
                    id: "aiquiz",
                  },
                  { name: "URL", icon: <Globe />, id: "url" },
                  { name: "PDF Uploader", icon: <BookOpen />, id: "pdf" },
                ].map((act) => (
                  <div
                    key={act.id}
                    onClick={() => setSelectedActivity(act.id)}
                    className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all cursor-pointer ${selectedActivity === act.id ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/20" : "border-glass-border hover:border-primary/50 text-main hover:bg-white/5 bg-surface"}`}
                  >
                    {act.new && (
                      <span className="absolute -top-3 px-3 py-1 bg-primary text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/30 z-10">
                        New
                      </span>
                    )}
                    <div
                      className={`p-4 rounded-xl ${selectedActivity === act.id ? "bg-primary/10" : "bg-background"}`}
                    >
                      {act.icon}
                    </div>
                    <span className="text-[10px] font-black text-center leading-tight h-8 flex items-center justify-center">
                      {act.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-glass-border flex items-center justify-between bg-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">
                Selected:{" "}
                <span className="text-primary">
                  {[
                    "ai",
                    "scorm",
                    "quiz",
                    "video",
                    "cert",
                    "ilt",
                    "assign",
                    "zoom",
                    "teams",
                    "aiquiz",
                    "url",
                    "pdf",
                  ].includes(selectedActivity)
                    ? "Activity Selected"
                    : "None"}
                </span>
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  disabled={!selectedActivity}
                  onClick={() => {
                    setShowActivityModal(false);
                    setActiveCourseView("add-activity");
                  }}
                  className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus size={14} /> Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRestrictionModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-3xl overflow-hidden flex flex-col">
            <div className="p-6 text-center border-b border-gray-100 relative">
              <h3 className="text-lg font-black text-main">
                Add restriction...
              </h3>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid gap-2">
                {[
                  {
                    title: "Cohort",
                    desc: "Allow only students who belong to a specified cohort.",
                  },
                  {
                    title: "Activity completion",
                    desc: "Require students to complete (or not complete) another activity.",
                  },
                  {
                    title: "Course completed",
                    desc: "Allow only students who already (or not yet) completed this course.",
                  },
                  {
                    title: "Date",
                    desc: "Prevent access until (or from) a specified date and time.",
                  },
                  {
                    title: "Days",
                    desc: "Prevent access until a specified day offset is reached relative to the course start date.",
                  },
                  {
                    title: "Grade",
                    desc: "Require students to achieve a specified grade.",
                  },
                  {
                    title: "Language",
                    desc: "Require students to use a certain language.",
                  },
                  {
                    title: "Mobile app",
                    desc: "Require students to access (or not access) using the Mobile app.",
                  },
                  {
                    title: "Other course completion",
                    desc: "Require students to complete other course .",
                  },
                  {
                    title: "User profile",
                    desc: "Control access based on fields within the student's profile.",
                  },
                  {
                    title: "Restriction set",
                    desc: "Add a set of nested restrictions to apply complex logic.",
                  },
                ].map((res) => (
                  <div
                    key={res.title}
                    onClick={() => {
                      setVideoActivityForm({
                        ...videoActivityForm,
                        restrictions: [
                          ...videoActivityForm.restrictions,
                          { title: res.title, desc: res.desc },
                        ],
                      });
                      setShowRestrictionModal(false);
                    }}
                    className="flex gap-6 p-4 hover:bg-sky-50 cursor-pointer rounded-2xl transition-all items-center border border-transparent hover:border-sky-100"
                  >
                    <div className="w-1/3 text-right">
                      <span className="text-[#0ea5e9] text-sm tracking-wide font-medium">
                        {res.title}
                      </span>
                    </div>
                    <div className="w-2/3">
                      <p className="text-xs font-bold text-gray-700 leading-relaxed">
                        {res.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 text-center border-t border-gray-100 bg-gray-50 flex justify-center">
              <button
                onClick={() => setShowRestrictionModal(false)}
                className="px-8 py-2.5 bg-white text-[#0ea5e9] font-black text-xs rounded-xl shadow-sm hover:shadow hover:bg-gray-50 transition-all tracking-widest uppercase"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalNav({ active, icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl transition-all font-black uppercase text-[10px] tracking-widest ${active ? "bg-primary text-white" : "text-muted hover:bg-white/5"}`}
    >
      {icon} {label}
    </button>
  );
}

function CompactInput({ label, type = "text", value, onChange, req, icon }) {
  return (
    <div className="space-y-3 flex-grow">
      <div className="flex items-center gap-2">
        {icon}{" "}
        <span className="text-[9px] font-black uppercase text-muted tracking-widest">
          {label}{" "}
          {req && <span className="text-red-500 text-lg leading-none">*</span>}
        </span>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 text-xs font-bold focus:border-primary transition-all outline-none"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function CompactSelect({ label, value, options, onChange, icon }) {
  return (
    <div className="space-y-3 flex-grow">
      <div className="flex items-center gap-2">
        {icon}{" "}
        <span className="text-[9px] font-black uppercase text-muted tracking-widest">
          {label}
        </span>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="academy-input w-full h-14 bg-background/50 border border-glass-border px-6 pr-12 text-xs font-bold appearance-none focus:border-primary transition-all outline-none"
        >
          {options.map((o) => (
            <option key={o.v} value={o.v}>
              {o.l}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
          size={14}
        />
      </div>
    </div>
  );
}

function CompactToggle({ label, checked, onChange }) {
  return (
    <button
      onClick={() => onChange?.(!checked)}
      className="flex items-center gap-4 group"
    >
      <div
        className={`w-12 h-6 rounded-full transition-all duration-300 relative ${checked ? "bg-primary" : "bg-white/10"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${checked ? "left-7" : "left-1"}`}
        />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
        {label}
      </span>
    </button>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="academy-card p-4 flex items-center gap-4 group hover:border-primary/50 transition-all">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-main tabular-nums">{value}</h3>
        <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest mt-1">
          {sub}
        </p>
      </div>
    </div>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-6 w-full max-w-[160px]">
      <div className="flex items-center gap-2.5">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[9px] font-black text-muted uppercase tracking-wider whitespace-nowrap">
          {label}
        </span>
      </div>
      <span className="text-[10px] font-black text-main tabular-nums">
        {value}
      </span>
    </div>
  );
}

function StatItem({ label, value, color = "text-main" }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase text-muted tracking-widest">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black ${color}`}>{value}</span>
        <Info size={10} className="text-muted/30" />
      </div>
    </div>
  );
}

function TopCourseRow({ name, views, enrolled, status }) {
  return (
    <div className="grid grid-cols-5 items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-all group">
      <div className="col-span-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-muted group-hover:text-primary transition-colors">
          <BookOpen size={14} />
        </div>
        <span className="text-[10px] font-bold text-main truncate max-w-[150px]">
          {name}
        </span>
      </div>
      <div className="text-[10px] font-black text-primary">{views}</div>
      <div className="text-[10px] font-black text-main">{enrolled}</div>
      <div>
        <span
          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${status === "Success" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

function NotificationSectionBar({ title }) {
  return (
    <div className="bg-surface/80 border border-glass-border rounded-lg px-4 py-2">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-main">
        {title}
      </h4>
    </div>
  );
}

function NotificationEnableRow({ label, enabled, onEnabledChange, inline }) {
  return (
    <div
      className={`flex items-center gap-3 ${inline ? "" : "justify-between"}`}
    >
      <span className="text-[11px] font-black uppercase text-main tracking-widest">
        {label}
      </span>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={!!enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-[10px] font-black uppercase text-main">
          Enable
        </span>
      </label>
    </div>
  );
}

function NotificationTagsFooter() {
  return (
    <p className="text-[10px] font-bold text-muted leading-relaxed">
      <span className="font-black uppercase tracking-widest text-main/70">
        Tags to be used:{" "}
      </span>
      {NOTIFICATION_TAGS.join(", ")}
    </p>
  );
}

function EmailTemplateEditor({ value, onChange }) {
  return (
    <div className="border border-glass-border rounded-2xl overflow-hidden shadow-inner bg-background/20">
      <div className="bg-surface border-b border-glass-border p-2 flex flex-wrap gap-1">
        <ToolbarBtn icon={<Undo size={14} />} />
        <div className="w-px h-6 bg-glass-border mx-1" />
        <ToolbarBtn icon={<Type size={14} />} dropdown />
        <ToolbarBtn icon={<Bold size={14} />} />
        <ToolbarBtn icon={<Italic size={14} />} />
        <div className="w-px h-6 bg-glass-border mx-1" />
        <ToolbarBtn icon={<List size={14} />} />
        <ToolbarBtn icon={<ListOrdered size={14} />} />
        <div className="w-px h-6 bg-glass-border mx-1" />
        <ToolbarBtn icon={<Link size={14} />} />
        <ToolbarBtn icon={<Scissors size={14} />} />
        <div className="w-px h-6 bg-glass-border mx-1" />
        <ToolbarBtn icon={<FileImage size={14} />} />
        <ToolbarBtn icon={<Video size={14} />} />
        <ToolbarBtn icon={<Accessibility size={14} />} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[140px] bg-background/30 p-4 text-xs font-bold focus:outline-none resize-y"
        placeholder="Compose email template..."
      />
    </div>
  );
}

function ToolbarBtn({ icon, dropdown }) {
  return (
    <button className="p-2 hover:bg-background/50 rounded-lg text-muted hover:text-primary transition-all flex items-center gap-1 border border-transparent hover:border-glass-border">
      {icon}
      {dropdown && <ChevronDown size={10} />}
    </button>
  );
}

function ManageUserStatCard({ label, value, icon, tone }) {
  const tones = {
    blue: "bg-sky-500/15 text-sky-600 border-sky-500/20",
    purple: "bg-violet-500/15 text-violet-600 border-violet-500/20",
    orange: "bg-orange-500/15 text-orange-600 border-orange-500/20",
    green: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    amber: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  };
  return (
    <div className="academy-card p-4 flex items-center justify-between gap-3 border border-glass-border rounded-xl">
      <div className="min-w-0">
        <p className="text-2xl font-black text-main leading-none tabular-nums">
          {value}
        </p>
        <p className="text-[10px] font-bold text-muted mt-1.5 flex items-center gap-1">
          {label} <Info size={12} className="opacity-40" />
        </p>
      </div>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${tones[tone] || tones.blue}`}
      >
        {icon}
      </div>
    </div>
  );
}

function ManagementStatCard({ icon, label, value, color }) {
  const colors = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    sky: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    teal: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  };
  return (
    <div
      className={`p-4 rounded-2xl border ${colors[color] || colors.emerald} flex flex-col gap-2 shadow-sm`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest opacity-80">
          {label}
        </span>
      </div>
      <span className="text-sm font-black tabular-nums">{value}</span>
    </div>
  );
}
