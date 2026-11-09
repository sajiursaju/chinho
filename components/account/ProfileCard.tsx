// components/account/ProfileCard.tsx
import Link from "next/link";

type Props = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
};

export default function ProfileCard({ id, name, email, avatar }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-5">
      {/* Avatar */}
      <div className="shrink-0">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            width={80}
            height={80}
            className="rounded-full object-cover w-20 h-20"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{email}</p>
        <p className="text-xs text-gray-400 mt-1">Client ID: #{id}</p>
      </div>

      {/* Edit button */}
      <Link
        href={`/account/${id}/edit`}
        className="text-sm bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition"
      >
        Edit Profile
      </Link>
    </div>
  );
}