import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import { useAuth } from '../auth/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { validateEmail, validateAge, getValidationMessages } from '../../utils/formValidation';
import { CrewMember, FormErrors } from '../../types/form.types';
import AnimatedButton from '../ui/AnimatedButton';
import GenreSelector from '../forms/GenreSelector';
import FormatSelector from '../forms/FormatSelector';
import CrewManagement from '../forms/CrewManagement';
import FormSection from '../forms/FormSection';
import ErrorMessage from '../forms/ErrorMessage';
import UnifiedFileUpload from '../forms/UnifiedFileUpload';
import UserZoneHeader from '../layout/UserZoneHeader';
import DraftSuccessDialog from '../dialogs/DraftSuccessDialog';

interface ApplicationEditPageProps {
  applicationId: string;
  onSidebarToggle?: () => void;
}

interface EditableApplicationData {
  id: string;
  userId: string;
  competitionCategory: 'youth' | 'future' | 'world';
  status: 'draft' | 'submitted';
  
  // Film Information
  filmTitle: string;
  filmTitleTh?: string;
  genres: string[];
  format: string;
  duration: number;
  synopsis: string;
  chiangmaiConnection?: string;
  
  // Submitter/Director Information
  submitterName?: string;
  submitterNameTh?: string;
  submitterAge?: number;
  submitterPhone?: string;
  submitterEmail?: string;
  submitterRole?: string;
  submitterCustomRole?: string;
  
  // Director Information (for world category)
  directorName?: string;
  directorNameTh?: string;
  directorAge?: number;
  directorPhone?: string;
  directorEmail?: string;
  directorRole?: string;
  directorCustomRole?: string;
  
  // Education Information
  schoolName?: string;
  studentId?: string;
  universityName?: string;
  faculty?: string;
  universityId?: string;
  
  // Crew Information
  crewMembers: CrewMember[];
  
  // Files
  files: {
    filmFile: {
      downloadURL: string;
      fileName: string;
      fileSize: number;
      storagePath: string;
    };
    posterFile: {
      downloadURL: string;
      fileName: string;
      fileSize: number;
      storagePath: string;
    };
    proofFile?: {
      downloadURL: string;
      fileName: string;
      fileSize: number;
      storagePath: string;
    };
  };
}

const ApplicationEditPage: React.FC<ApplicationEditPageProps> = ({ 
  applicationId, 
  onSidebarToggle 
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const { user } = useAuth();
  const currentLanguage = i18n.language as 'en' | 'th';
  const validationMessages = getValidationMessages(currentLanguage);

  const [application, setApplication] = useState<EditableApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isThaiNationality, setIsThaiNationality] = useState(true);
  const [showDraftSuccessDialog, setShowDraftSuccessDialog] = useState(false);
  const [savedApplicationId, setSavedApplicationId] = useState<string>('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      if (!user || !applicationId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'submissions', applicationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Verify ownership
          if (data.userId !== user.uid) {
            setError(currentLanguage === 'th' ? 'คุณไม่มีสิทธิ์แก้ไขใบสมัครนี้' : 'You do not have permission to edit this application');
            return;
          }

          // Check if application can be edited
          if (data.status !== 'draft') {
            setError(currentLanguage === 'th' ? 'ไม่สามารถแก้ไขใบสมัครที่ส่งแล้ว' : 'Cannot edit submitted applications');
            return;
          }

          // Map Firestore data to editable format
          const mappedApplication: EditableApplicationData = {
            id: docSnap.id,
            userId: data.userId,
            competitionCategory: data.competitionCategory || data.category,
            status: data.status,
            
            // Film Information
            filmTitle: data.filmTitle || '',
            filmTitleTh: data.filmTitleTh,
            genres: data.genres || [],
            format: data.format || '',
            duration: data.duration || 0,
            synopsis: data.synopsis || '',
            chiangmaiConnection: data.chiangmaiConnection,
            
            // Submitter Information
            submitterName: data.submitterName,
            submitterNameTh: data.submitterNameTh,
            submitterAge: data.submitterAge,
            submitterPhone: data.submitterPhone,
            submitterEmail: data.submitterEmail,
            submitterRole: data.submitterRole,
            submitterCustomRole: data.submitterCustomRole,
            
            // Director Information (for world category)
            directorName: data.directorName,
            directorNameTh: data.directorNameTh,
            directorAge: data.directorAge,
            directorPhone: data.directorPhone,
            directorEmail: data.directorEmail,
            directorRole: data.directorRole,
            directorCustomRole: data.directorCustomRole,
            
            // Education Information
            schoolName: data.schoolName,
            studentId: data.studentId,
            universityName: data.universityName,
            faculty: data.faculty,
            universityId: data.universityId,
            
            // Crew Information
            crewMembers: (data.crewMembers || []).map((member: any, index: number) => ({
              id: member.id || index.toString(),
              fullName: member.fullName || '',
              fullNameTh: member.fullNameTh,
              role: member.role || '',
              customRole: member.customRole,
              age: member.age || 18,
              phone: member.phone,
              email: member.email,
              schoolName: member.schoolName || data.schoolName || data.universityName || '',
              studentId: member.studentId || ''
            })),
            
            // Files
            files: {
              filmFile: {
                downloadURL: data.files?.filmFile?.downloadURL || '',
                fileName: data.files?.filmFile?.fileName || '',
                fileSize: data.files?.filmFile?.fileSize || 0,
                storagePath: data.files?.filmFile?.storagePath || ''
              },
              posterFile: {
                downloadURL: data.files?.posterFile?.downloadURL || '',
                fileName: data.files?.posterFile?.fileName || '',
                fileSize: data.files?.posterFile?.fileSize || 0,
                storagePath: data.files?.posterFile?.storagePath || ''
              },
              proofFile: {
                downloadURL: data.files?.proofFile?.downloadURL || '',
                fileName: data.files?.proofFile?.fileName || '',
                fileSize: data.files?.proofFile?.fileSize || 0,
                storagePath: data.files?.proofFile?.storagePath || ''
              }
            }
          };

          setApplication(mappedApplication);
          
          // Determine nationality type for Thai-specific fields
          setIsThaiNationality(!!(data.filmTitleTh || data.submitterNameTh || data.directorNameTh));
          
        } else {
          setError(currentLanguage === 'th' ? 'ไม่พบใบสมัครที่ระบุ' : 'Application not found');
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError(currentLanguage === 'th' ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล' : 'Error loading application data');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user, applicationId, currentLanguage]);

  const content = {
    th: {
      pageTitle: "แก้ไขใบสมัคร",
      
      // Sections
      filmInfoTitle: "ข้อมูลภาพยนตร์",
      submitterInfoTitle: "ข้อมูลผู้ส่งผลงาน",
      directorInfoTitle: "ข้อมูลผู้กำกับ",
      crewTitle: "ข้อมูลทีมงาน",
      filesTitle: "ไฟล์ที่แนบ",
      
      // Form fields
      filmTitle: "ชื่อภาพยนตร์ (ภาษาอังกฤษ)",
      filmTitleTh: "ชื่อภาพยนตร์ (ภาษาไทย)",
      duration: "ความยาว (นาที)",
      synopsis: "เรื่องย่อ",
      chiangmaiConnection: "ความเกี่ยวข้องกับเชียงใหม่",
      
      submitterName: "ชื่อ-นามสกุล",
      submitterNameTh: "ชื่อ-นามสกุล (ภาษาไทย)",
      age: "อายุ",
      phone: "เบอร์โทรศัพท์",
      email: "อีเมล",
      roleInFilm: "บทบาทในภาพยนตร์",
      schoolName: "ชื่อโรงเรียน",
      studentId: "รหัสนักเรียน",
      universityName: "ชื่อมหาวิทยาลัย",
      faculty: "คณะ/สาขา",
      universityId: "รหัสนักศึกษา",
      
      selectRole: "เลือกบทบาท",
      specifyRole: "ระบุบทบาท",
      
      saveButton: "บันทึกการเปลี่ยนแปลง",
      saving: "กำลังบันทึก...",
      deleteButton: "ลบใบสมัคร",
      submitButton: "ส่งใบสมัคร"
    },
    en: {
      pageTitle: "Edit Application",
      
      // Sections
      filmInfoTitle: "Film Information",
      submitterInfoTitle: "Submitter Information",
      directorInfoTitle: "Director Information",
      crewTitle: "Crew Information",
      filesTitle: "Attached Files",
      
      // Form fields
      filmTitle: "Film Title (English)",
      filmTitleTh: "Film Title (Thai)",
      duration: "Duration (minutes)",
      synopsis: "Synopsis",
      chiangmaiConnection: "Connection to Chiang Mai",
      
      submitterName: "Full Name",
      submitterNameTh: "Full Name (Thai)",
      age: "Age",
      phone: "Phone Number",
      email: "Email",
      roleInFilm: "Role in Film",
      schoolName: "School Name",
      studentId: "Student ID",
      universityName: "University Name",
      faculty: "Faculty/Department",
      universityId: "Student ID",
      
      selectRole: "Select Role",
      specifyRole: "Specify Role",
      
      saveButton: "Save Changes",
      saving: "Saving...",
      deleteButton: "Delete Application",
      submitButton: "Submit Application"
    }
  };

  const currentContent = content[currentLanguage];

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!application) return errors;

    // Film Information
    if (!application.filmTitle.trim()) errors.filmTitle = validationMessages.required;
    // Film Title (Thai) is now optional for all cases
    // if (isThaiNationality && !application.filmTitleTh?.trim()) errors.filmTitleTh = validationMessages.required;
    if (!application.genres || application.genres.length === 0) errors.genres = validationMessages.required;
    if (!application.format) errors.format = validationMessages.formatRequired;
    if (!application.duration || application.duration <= 0) errors.duration = validationMessages.required;
    if (!application.synopsis.trim()) errors.synopsis = validationMessages.required;

    // Submitter/Director Information
    const isWorldCategory = application.competitionCategory === 'world';
    const nameField = isWorldCategory ? 'directorName' : 'submitterName';
    const nameThField = isWorldCategory ? 'directorNameTh' : 'submitterNameTh';
    const ageField = isWorldCategory ? 'directorAge' : 'submitterAge';
    const phoneField = isWorldCategory ? 'directorPhone' : 'submitterPhone';
    const emailField = isWorldCategory ? 'directorEmail' : 'submitterEmail';
    const roleField = isWorldCategory ? 'directorRole' : 'submitterRole';

    const name = isWorldCategory ? application.directorName : application.submitterName;
    const nameTh = isWorldCategory ? application.directorNameTh : application.submitterNameTh;
    const age = isWorldCategory ? application.directorAge : application.submitterAge;
    const phone = isWorldCategory ? application.directorPhone : application.submitterPhone;
    const email = isWorldCategory ? application.directorEmail : application.submitterEmail;
    const role = isWorldCategory ? application.directorRole : application.submitterRole;

    if (!name?.trim()) errors[nameField] = validationMessages.required;
    if (isThaiNationality && !nameTh?.trim()) errors[nameThField] = validationMessages.required;
    if (!age) errors[ageField] = validationMessages.required;
    if (!phone?.trim()) errors[phoneField] = validationMessages.required;
    if (!email?.trim()) {
      errors[emailField] = validationMessages.required;
    } else if (!validateEmail(email)) {
      errors[emailField] = validationMessages.invalidEmail;
    }
    if (!role) errors[roleField] = validationMessages.required;

    // Education fields (not required for world category)
    if (application.competitionCategory === 'youth') {
      if (!application.schoolName?.trim()) errors.schoolName = validationMessages.required;
      if (!application.studentId?.trim()) errors.studentId = validationMessages.required;
    } else if (application.competitionCategory === 'future') {
      if (!application.universityName?.trim()) errors.universityName = validationMessages.required;
      if (!application.faculty?.trim()) errors.faculty = validationMessages.required;
      if (!application.universityId?.trim()) errors.universityId = validationMessages.required;
    }

    return errors;
  };

  const handleInputChange = (field: string, value: any) => {
    if (!application) return;

    setApplication(prev => prev ? { ...prev, [field]: value } : null);

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenreChange = (genres: string[]) => {
    handleInputChange('genres', genres);
  };

  const handleFormatChange = (format: 'live-action' | 'animation') => {
    handleInputChange('format', format);
  };

  const handleCrewMembersChange = (crewMembers: CrewMember[]) => {
    handleInputChange('crewMembers', crewMembers);
  };

  const handleFileReplaced = (fileType: string, newFileMetadata: any) => {
    if (!application) return;

    setApplication(prev => prev ? {
      ...prev,
      files: {
        ...prev.files,
        [fileType]: {
          downloadURL: newFileMetadata.downloadURL,
          fileName: newFileMetadata.fileName,
          fileSize: newFileMetadata.fileSize,
          storagePath: newFileMetadata.storagePath
        }
      }
    } : null);
  };

  const handleSave = async () => {
    if (!application || saving) return;

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const docRef = doc(db, 'submissions', applicationId);
      
      // Prepare update data
      const updateData: any = {
        // Film Information
        filmTitle: application.filmTitle,
        filmTitleTh: application.filmTitleTh || null,
        genres: application.genres,
        format: application.format,
        duration: application.duration,
        synopsis: application.synopsis,
        chiangmaiConnection: application.chiangmaiConnection || null,
        
        // Crew Information
        crewMembers: application.crewMembers.map(member => ({
          id: member.id,
          fullName: member.fullName,
          fullNameTh: member.fullNameTh || null,
          role: member.role,
          customRole: member.customRole || null,
          age: member.age,
          phone: member.phone || null,
          email: member.email || null,
          schoolName: member.schoolName || null,
          studentId: member.studentId || null
        })),
        
        // Update timestamp
        lastModified: serverTimestamp()
      };

      // Add category-specific fields
      if (application.competitionCategory === 'world') {
        updateData.directorName = application.directorName || null;
        updateData.directorNameTh = application.directorNameTh || null;
        updateData.directorAge = application.directorAge || null;
        updateData.directorPhone = application.directorPhone || null;
        updateData.directorEmail = application.directorEmail || null;
        updateData.directorRole = application.directorRole || null;
        updateData.directorCustomRole = application.directorCustomRole || null;
      } else {
        updateData.submitterName = application.submitterName || null;
        updateData.submitterNameTh = application.submitterNameTh || null;
        updateData.submitterAge = application.submitterAge || null;
        updateData.submitterPhone = application.submitterPhone || null;
        updateData.submitterEmail = application.submitterEmail || null;
        updateData.submitterRole = application.submitterRole || null;
        updateData.submitterCustomRole = application.submitterCustomRole || null;
        
        if (application.competitionCategory === 'youth') {
          updateData.schoolName = application.schoolName || null;
          updateData.studentId = application.studentId || null;
        } else if (application.competitionCategory === 'future') {
          updateData.universityName = application.universityName || null;
          updateData.faculty = application.faculty || null;
          updateData.universityId = application.universityId || null;
        }
      }

      await updateDoc(docRef, updateData);

      // Show draft success dialog instead of alert
      setSavedApplicationId(application.id);
      setShowDraftSuccessDialog(true);

    } catch (error) {
      console.error('Error saving application:', error);
      setError(currentLanguage === 'th' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    window.location.hash = `#application-detail/${applicationId}`;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSubmitNow = async () => {
    setShowDraftSuccessDialog(false);
    // Navigate to application detail page for submission
    window.location.hash = `#application-detail/${application?.id}`;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleReviewLater = () => {
    setShowDraftSuccessDialog(false);
    // Navigate to applications list
    window.location.hash = '#my-applications';
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCloseDraftDialog = () => {
    setShowDraftSuccessDialog(false);
    // Stay on current page for continued editing
  };

  const getCategoryLogo = (category: string) => {
    const logos = {
      youth: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%202.png?alt=media&token=e8be419f-f0b2-4f64-8d7f-c3e8532e2689",
      future: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%203.png?alt=media&token=b66cd708-0dc3-4c05-bc56-b2f99a384287",
      world: "https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%204.png?alt=media&token=84ad0256-2322-4999-8e9f-d2f30c7afa67"
    };
    return logos[category as keyof typeof logos];
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-8">
        <UserZoneHeader
          title={currentContent.pageTitle}
          onSidebarToggle={onSidebarToggle || (() => {})}
        />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCB283] mb-4"></div>
          <p className={`${getClass('body')} text-white/80`}>
            {currentLanguage === 'th' ? 'กำลังโหลด...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="space-y-8">
        <UserZoneHeader
          title={currentContent.pageTitle}
          showBackButton={true}
          onBackClick={handleBack}
          onSidebarToggle={onSidebarToggle || (() => {})}
        />
        
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className={`text-2xl ${getClass('header')} mb-4 text-white`}>
            {error}
          </h2>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-8">
        <UserZoneHeader
          title={currentContent.pageTitle}
          showBackButton={true}
          onBackClick={handleBack}
          onSidebarToggle={onSidebarToggle || (() => {})}
        />
        
        <div className="text-center py-12">
          <div className="text-6xl mb-6">📄</div>
          <h2 className={`text-2xl ${getClass('header')} mb-4 text-white`}>
            {currentLanguage === 'th' ? 'ไม่พบใบสมัคร' : 'Application Not Found'}
          </h2>
        </div>
      </div>
    );
  }

  const isWorldCategory = application.competitionCategory === 'world';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* User Zone Header */}
      <UserZoneHeader
        title={application.filmTitle}
        subtitle={currentContent.pageTitle}
        showBackButton={true}
        backButtonText={currentLanguage === 'th' ? 'กลับไปรายละเอียด' : 'Back to Details'}
        onBackClick={handleBack}
        onSidebarToggle={onSidebarToggle || (() => {})}
      >
        <div className="flex justify-center">
          <img 
            src={getCategoryLogo(application.competitionCategory)}
            alt={`${application.competitionCategory} Competition Logo`}
            className="h-12 w-auto object-contain"
          />
        </div>
      </UserZoneHeader>

      {/* Error Display */}
      {error && (
        <div className="glass-container rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-2xl">❌</span>
            <h3 className={`${getClass('subtitle')} text-red-400`}>
              {currentLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Error'}
            </h3>
          </div>
          <p className={`${getClass('body')} text-red-300`}>
            {error}
          </p>
        </div>
      )}

      {/* Edit Form */}
      <div className="space-y-6 sm:space-y-8">
        
        {/* Section 1: Film Information */}
        <FormSection title={currentContent.filmInfoTitle} icon="🎬" className="w-full">
            <div className="space-y-6">
              {/* Film Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.filmTitle} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={application.filmTitle}
                    onChange={(e) => handleInputChange('filmTitle', e.target.value)}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitle ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.filmTitle} />
                </div>
                
                {isThaiNationality && (
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.filmTitleTh}
                    </label>
                    <input
                      type="text"
                      value={application.filmTitleTh || ''}
                      onChange={(e) => handleInputChange('filmTitleTh', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitleTh ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.filmTitleTh} />
                  </div>
                )}
              </div>
              
              {/* Genre Selector */}
              <GenreSelector
                value={application.genres}
                onChange={handleGenreChange}
                error={formErrors.genres}
                required
                label={currentLanguage === 'th' ? 'แนวภาพยนตร์' : 'Genre'}
              />
              
              {/* Format Selector */}
              <FormatSelector
                value={application.format as 'live-action' | 'animation' | ''}
                onChange={handleFormatChange}
                error={formErrors.format}
                required
                label={currentLanguage === 'th' ? 'รูปแบบภาพยนตร์' : 'Film Format'}
              />
              
              {/* Duration */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.duration} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={application.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  min="1"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.duration ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.duration} />
              </div>
            
              {/* Synopsis */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.synopsis} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={application.synopsis}
                  onChange={(e) => handleInputChange('synopsis', e.target.value)}
                  rows={4}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.synopsis ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
                />
                <ErrorMessage error={formErrors.synopsis} />
              </div>
            
              {/* Chiang Mai Connection (if exists) */}
              {application.chiangmaiConnection !== undefined && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.chiangmaiConnection}
                  </label>
                  <textarea
                    value={application.chiangmaiConnection || ''}
                    onChange={(e) => handleInputChange('chiangmaiConnection', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical"
                  />
                </div>
              )}
            </div>
        </FormSection>

        {/* Section 2: Submitter/Director Information */}
        <FormSection title={isWorldCategory ? currentContent.directorInfoTitle : currentContent.submitterInfoTitle} icon="👤" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.submitterName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={isWorldCategory ? application.directorName || '' : application.submitterName || ''}
                  onChange={(e) => handleInputChange(isWorldCategory ? 'directorName' : 'submitterName', e.target.value)}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorName' : 'submitterName'] ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors[isWorldCategory ? 'directorName' : 'submitterName']} />
              </div>
              
              {isThaiNationality && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.submitterNameTh} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={isWorldCategory ? application.directorNameTh || '' : application.submitterNameTh || ''}
                    onChange={(e) => handleInputChange(isWorldCategory ? 'directorNameTh' : 'submitterNameTh', e.target.value)}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorNameTh' : 'submitterNameTh'] ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors[isWorldCategory ? 'directorNameTh' : 'submitterNameTh']} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.age} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={isWorldCategory ? application.directorAge || '' : application.submitterAge || ''}
                  onChange={(e) => handleInputChange(isWorldCategory ? 'directorAge' : 'submitterAge', parseInt(e.target.value) || 0)}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorAge' : 'submitterAge'] ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors[isWorldCategory ? 'directorAge' : 'submitterAge']} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.phone} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={isWorldCategory ? application.directorPhone || '' : application.submitterPhone || ''}
                  onChange={(e) => handleInputChange(isWorldCategory ? 'directorPhone' : 'submitterPhone', e.target.value)}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorPhone' : 'submitterPhone'] ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors[isWorldCategory ? 'directorPhone' : 'submitterPhone']} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.email} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={isWorldCategory ? application.directorEmail || '' : application.submitterEmail || ''}
                  onChange={(e) => handleInputChange(isWorldCategory ? 'directorEmail' : 'submitterEmail', e.target.value)}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorEmail' : 'submitterEmail'] ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors[isWorldCategory ? 'directorEmail' : 'submitterEmail']} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.roleInFilm} <span className="text-red-400">*</span>
                </label>
                <select
                  value={isWorldCategory ? application.directorRole || '' : application.submitterRole || ''}
                  onChange={(e) => handleInputChange(isWorldCategory ? 'directorRole' : 'submitterRole', e.target.value)}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors[isWorldCategory ? 'directorRole' : 'submitterRole'] ? 'border-red-400 error-field' : 'border-white/20'} text-white focus:border-[#FCB283] focus:outline-none`}
                >
                  <option value="" className="bg-[#110D16]">{currentContent.selectRole}</option>
                  {['Director', 'Producer', 'Cinematographer', 'Editor', 'Sound Designer', 'Production Designer', 'Costume Designer', 'Makeup Artist', 'Screenwriter', 'Composer', 'Casting Director', 'Visual Effects Supervisor', 'Location Manager', 'Script Supervisor', 'Assistant Director', 'Other'].map(role => (
                    <option key={role} value={role} className="bg-[#110D16]">
                      {role}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={formErrors[isWorldCategory ? 'directorRole' : 'submitterRole']} />
              </div>
              
              {/* Education Fields */}
              {application.competitionCategory === 'youth' && (
                <>
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.schoolName} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={application.schoolName || ''}
                      onChange={(e) => handleInputChange('schoolName', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.schoolName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.schoolName} />
                  </div>
                  
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.studentId} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={application.studentId || ''}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.studentId ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.studentId} />
                  </div>
                </>
              )}
              
              {application.competitionCategory === 'future' && (
                <>
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.universityName} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={application.universityName || ''}
                      onChange={(e) => handleInputChange('universityName', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.universityName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.universityName} />
                  </div>
                  
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.faculty} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={application.faculty || ''}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.faculty ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.faculty} />
                  </div>
                  
                  <div>
                    <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                      {currentContent.universityId} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={application.universityId || ''}
                      onChange={(e) => handleInputChange('universityId', e.target.value)}
                      className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.universityId ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                    />
                    <ErrorMessage error={formErrors.universityId} />
                  </div>
                </>
              )}
            </div>
        </FormSection>

        {/* Section 3: Crew Management */}
        <CrewManagement
          crewMembers={application.crewMembers}
          onCrewMembersChange={handleCrewMembersChange}
          isThaiNationality={isThaiNationality}
          submitterSchoolName={application.schoolName}
          submitterUniversityName={application.universityName}
          error={formErrors.crewMembers}
          isWorldForm={isWorldCategory}
          className="w-full"
          competitionCategory={application.competitionCategory}
        />

        {/* Section 4: File Management */}
        <FormSection title={currentContent.filesTitle} icon="📁" className="w-full">
            <div className="space-y-6">
              <UnifiedFileUpload
                mode="replace"
                name="filmFile"
                label={currentLanguage === 'th' ? 'ไฟล์ภาพยนตร์' : 'Film File'}
                accept=".mp4,.mov"
                fileType="VIDEO"
                applicationId={application.id}
                currentFileName={application.files.filmFile.fileName}
                onFileReplaced={(newFileMetadata: any) => handleFileReplaced('filmFile', newFileMetadata)}
                onError={(error: string) => setError(error)}
              />
              
              <UnifiedFileUpload
                mode="replace"
                name="posterFile"
                label={currentLanguage === 'th' ? 'โปสเตอร์ภาพยนตร์' : 'Film Poster'}
                accept=".jpg,.jpeg,.png"
                fileType="IMAGE"
                applicationId={application.id}
                currentFileName={application.files.posterFile.fileName}
                onFileReplaced={(newFileMetadata: any) => handleFileReplaced('posterFile', newFileMetadata)}
                onError={(error: string) => setError(error)}
              />
              
              <UnifiedFileUpload
                mode="replace"
                name="proofFile"
                label={currentLanguage === 'th' ? 'หลักฐาน' : 'Proof Document'}
                accept={application.competitionCategory === 'youth' ? ".pdf,.jpg,.jpeg,.png" : "image/*,.pdf"}
                fileType="DOCUMENT"
                applicationId={application.id}
                currentFileName={application.files.proofFile?.fileName || 'No proof file'}
                onFileReplaced={(newFileMetadata: any) => handleFileReplaced('proofFile', newFileMetadata)}
                onError={(error: string) => setError(error)}
              />
            </div>
        </FormSection>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8">
          {/* Delete Button - Left */}
          <AnimatedButton
            variant="outline"
            size="large"
            icon="🗑️"
            onClick={() => {
              const confirmed = window.confirm(
                currentLanguage === 'th' 
                  ? 'คุณแน่ใจหรือไม่ที่จะลบใบสมัครนี้?'
                  : 'Are you sure you want to delete this application?'
              );
              if (confirmed) {
                // TODO: Implement delete functionality
                console.log('Delete application');
              }
            }}
            className={saving ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {currentContent.deleteButton}
          </AnimatedButton>

          {/* Save Button - Right */}
          <AnimatedButton
            variant="primary"
            size="large"
            icon="💾"
            onClick={handleSave}
            disabled={saving}
            className={`${getClass('menu')} ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? currentContent.saving : currentContent.saveButton}
          </AnimatedButton>
        </div>
      </div>

      {/* Draft Success Dialog */}
      <DraftSuccessDialog
        isOpen={showDraftSuccessDialog}
        onClose={handleCloseDraftDialog}
        onSubmitNow={handleSubmitNow}
        onReviewLater={handleReviewLater}
        applicationId={savedApplicationId}
        isDraft={true}
      />
    </div>
  );
};

export default ApplicationEditPage;