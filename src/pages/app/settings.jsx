import { AppLayout, InputHelper, LoadButton } from "@/components";
import { useToast, useValidations } from "@/hooks";
import { Fragment, useMemo, useState } from "react";

// Mock signed-in user, matches the placeholder account shown in the sidebar until a profile endpoint exists.
const CURRENT_USER_DETAILS = {
    firstName: "Victor",
    lastName: "Ogbonna",
    email: "victor@webbi.com",
    phone: "+234 810 260 3301"
};

const PROFILE_FIELDS = [
    { label: "First Name", value: "firstName", type: "text", placeholder: "John" },
    { label: "Last Name", value: "lastName", type: "text", placeholder: "Doe" },
    { label: "Email", value: "email", type: "email", placeholder: "name@company.com" },
    { label: "Phone Number", value: "phone", type: "phone", placeholder: "+234 82728922" }
];

const PASSWORD_FIELDS = [
    { label: "Current Password", value: "current_password", type: "password", placeholder: "********" },
    { label: "New Password", value: "new_password", type: "password", placeholder: "********", extraText: "Minimum 8 characters with at least one number." },
    { label: "Confirm New Password", value: "confirm_new_password", type: "password", placeholder: "********" }
];

export default function Settings() {
    return (
        <AppLayout active={'Settings'}>
            <SettingsTemplate />
        </AppLayout>
    );
}

function SettingsTemplate() {
    return (
        <main className="flex-1 h-screen overflow-y-auto p-4 tablet:p-4 pb-24">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-2xl tablet:text-xl font-semibold text-slate-900 tracking-tight">
                        Settings
                    </h1>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Manage your profile information and account security.
                    </p>
                </div>

                <ProfileSection />
                <ChangePasswordSection />
            </div>
        </main>
    );
}

function ProfileSection() {
    const { NotifyError, NotifySuccess } = useToast();
    const { isEmail } = useValidations();
    const [formData, setFormData] = useState(CURRENT_USER_DETAILS);

    const handleSaveProfile = () => {
        if (!isEmail(formData.email)) return NotifyError('Enter a valid email address');
        if (!formData.firstName || !formData.lastName) return NotifyError('First and last name are required');
        // No profile endpoint yet, current details are only updated locally.
        return NotifySuccess('Profile updated');
    };

    return (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                <p className="text-sm text-slate-500">Update your personal details.</p>
            </div>

            <div className="grid grid-cols-2 gap-5 tablet:grid-cols-1">
                {PROFILE_FIELDS.map((props, ind) => (
                    <Fragment key={ind}>
                        <InputHelper
                            {...props}
                            showLabel={true}
                            value={formData[props.value]}
                            onChange={(e) => setFormData({ ...formData, [props.value]: e.target.value })}
                        />
                    </Fragment>
                ))}
            </div>

            <LoadButton
                onClick={handleSaveProfile}
                className="mt-5 bg-primary text-white px-6 py-2.5 rounded-lg"
            >
                Save Changes
            </LoadButton>
        </section>
    );
}

function ChangePasswordSection() {
    const { NotifyError, NotifySuccess } = useToast();
    const { isLength } = useValidations();
    const [passwordData, setPasswordData] = useState({});

    const isValid = useMemo(() => passwordData.current_password
        && isLength({ value: passwordData.new_password || '', minlength: 8 })
        && passwordData.new_password === passwordData.confirm_new_password, [passwordData, isLength]);  
    

    const handleChangePassword = () => {
        if (!passwordData.current_password) return NotifyError('Enter your current password');
        if (!isLength({ value: passwordData.new_password || '', minlength: 8 })) return NotifyError('New password must be at least 8 characters');
        if (passwordData.new_password !== passwordData.confirm_new_password) return NotifyError('New password and confirmation do not match');
        // No password endpoint yet, this only updates local form state.
        setPasswordData({});
        return NotifySuccess('Password updated');
    };

    return (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 tablet:p-4 shadow-sm">
            <div className="mb-5">
                <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                <p className="text-sm text-slate-500">Enter your current password and choose a new one.</p>
            </div>

            <div className="grid grid-cols-2 gap-5 tablet:grid-cols-1">
                {PASSWORD_FIELDS.map((props, ind) => (
                    <Fragment key={ind}>
                        <InputHelper
                            {...props}
                            showLabel={true}
                            value={passwordData[props.value]}
                            onChange={(e) => setPasswordData({ ...passwordData, [props.value]: e.target.value })}
                        />
                    </Fragment>
                ))}
            </div>

            <LoadButton
                disabled={!isValid}
                onClick={handleChangePassword}
                className="mt-5 bg-primary text-white px-6 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
                Update Password
            </LoadButton>
        </section>
    );
}
