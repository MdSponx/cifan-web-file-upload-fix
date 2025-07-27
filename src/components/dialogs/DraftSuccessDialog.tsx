import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import AnimatedButton from '../ui/AnimatedButton';
import { CheckCircle, Clock, AlertTriangle, FileText, Eye, List, X } from 'lucide-react';

interface DraftSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNow: () => void;
  onReviewLater: () => void;
  applicationId: string;
  isDraft?: boolean;
}

const DraftSuccessDialog: React.FC<DraftSuccessDialogProps> = ({
  isOpen,
  onClose,
  onSubmitNow,
  onReviewLater,
  applicationId,
  isDraft = true
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';

  const [isProcessing, setIsProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Submission deadline: September 5, 2025, 11:59 PM Thailand time
  const deadline = new Date('2025-09-05T23:59:59+07:00');

  const content = {
    th: {
      title: 'บันทึกร่างสำเร็จ!',
      subtitle: 'การสมัครของคุณเกือบสำเร็จแล้ว',
      message: 'ร่างใบสมัครได้รับการบันทึกเรียบร้อยแล้ว กรุณาตรวจทานข้อมูลอีกครั้งก่อนส่งใบสมัครจริง',
      deadline: 'เวลาสิ้นสุดการรับสมัคร: 5 กันยายน 2568',
      timeRemaining: 'เหลือเวลาอีก',
      submitNow: 'ส่งใบสมัครเลย',
      submitNowDesc: 'ตรวจสอบข้อมูลและส่งใบสมัครทันที',
      reviewLater: 'ตรวจทานทีหลัง',
      reviewLaterDesc: 'ไปยังหน้า "ใบสมัครของฉัน" เพื่อแก้ไขและส่งในภายหลัง',
      important: 'สำคัญ:',
      importantNote: 'ใบสมัครจะไม่สมบูรณ์จนกว่าคุณจะกดปุ่ม "ส่งใบสมัคร" ในหน้า Application Detail',
      applicationId: 'รหัสใบสมัคร:',
      deadlinePassed: 'หมดเวลาการรับสมัครแล้ว',
      days: 'วัน',
      hours: 'ชั่วโมง',
      minutes: 'นาที',
      processing: 'กำลังดำเนินการ...'
    },
    en: {
      title: 'Draft Saved Successfully!',
      subtitle: 'Your application is almost complete',
      message: 'Your application draft has been saved successfully. Please review your information once more before submitting your final application.',
      deadline: 'Submission Deadline: September 5, 2025',
      timeRemaining: 'Time Remaining',
      submitNow: 'Submit Now',
      submitNowDesc: 'Review and submit your application immediately',
      reviewLater: 'Review Later',
      reviewLaterDesc: 'Go to "My Applications" to edit and submit later',
      important: 'Important:',
      importantNote: 'Your application will not be complete until you click "Submit Application" on the Application Detail page',
      applicationId: 'Application ID:',
      deadlinePassed: 'Deadline has passed',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      processing: 'Processing...'
    }
  };

  const currentContent = content[currentLanguage];

  // Calculate time remaining until deadline
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const timeDiff = deadline.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining(currentContent.deadlinePassed);
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days} ${currentContent.days} ${hours} ${currentContent.hours}`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours} ${currentContent.hours} ${minutes} ${currentContent.minutes}`);
      } else {
        setTimeRemaining(`${minutes} ${currentContent.minutes}`);
      }
    };

    if (isOpen) {
      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [isOpen, currentLanguage, deadline]);

  const handleSubmitNow = async () => {
    setIsProcessing(true);
    try {
      await onSubmitNow();
    } catch (error) {
      console.error('Error during submit now:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewLater = async () => {
    setIsProcessing(true);
    try {
      await onReviewLater();
    } catch (error) {
      console.error('Error during review later:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-container rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Success Icon with Bounce Animation */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </div>

            {/* Title and Subtitle */}
            <h2 className={`text-2xl sm:text-3xl ${getClass('header')} text-white mb-3`}>
              {currentContent.title}
            </h2>
            <h3 className={`text-lg ${getClass('subtitle')} text-white/90 mb-4`}>
              {currentContent.subtitle}
            </h3>
            <p className={`${getClass('body')} text-white/80 leading-relaxed max-w-lg mx-auto`}>
              {currentContent.message}
            </p>

            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>
          </div>

          {/* Deadline Warning Box */}
          <div className="mb-6">
            <div className="glass-card p-4 rounded-xl border-l-4 border-orange-400/30 bg-orange-500/10">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-orange-400 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className={`${getClass('subtitle')} text-orange-400 mb-1`}>
                    {currentContent.deadline}
                  </h4>
                  <p className={`${getClass('body')} text-white/90 text-sm`}>
                    {currentContent.timeRemaining}: <span className="font-bold text-orange-300">{timeRemaining}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice Box */}
          <div className="mb-8">
            <div className="glass-card p-4 rounded-xl border-l-4 border-red-400/30 bg-red-500/10">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className={`${getClass('subtitle')} text-red-400 mb-2`}>
                    {currentContent.important}
                  </h4>
                  <p className={`${getClass('body')} text-white/90 text-sm leading-relaxed`}>
                    {currentContent.importantNote}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            
            {/* Submit Now Option */}
            <div className="glass-card p-6 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
                <h4 className={`text-lg ${getClass('subtitle')} text-green-400 mb-2`}>
                  {currentContent.submitNow}
                </h4>
                <p className={`${getClass('body')} text-white/80 text-sm mb-4 leading-relaxed`}>
                  {currentContent.submitNowDesc}
                </p>
                <AnimatedButton
                  variant="primary"
                  size="medium"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={handleSubmitNow}
                  className={`w-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? currentContent.processing : currentContent.submitNow}
                </AnimatedButton>
              </div>
            </div>

            {/* Review Later Option */}
            <div className="glass-card p-6 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 group">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <List className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className={`text-lg ${getClass('subtitle')} text-blue-400 mb-2`}>
                  {currentContent.reviewLater}
                </h4>
                <p className={`${getClass('body')} text-white/80 text-sm mb-4 leading-relaxed`}>
                  {currentContent.reviewLaterDesc}
                </p>
                <AnimatedButton
                  variant="secondary"
                  size="medium"
                  icon={<List className="w-4 h-4" />}
                  onClick={handleReviewLater}
                  className={`w-full ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? currentContent.processing : currentContent.reviewLater}
                </AnimatedButton>
              </div>
            </div>
          </div>

          {/* Footer - Application ID */}
          <div className="text-center pt-6 border-t border-white/20">
            <p className={`text-sm ${getClass('body')} text-white/60`}>
              {currentContent.applicationId} <span className="font-mono text-[#FCB283]">{applicationId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftSuccessDialog;