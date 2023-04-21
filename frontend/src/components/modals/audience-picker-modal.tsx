import { GoGlobe } from "react-icons/go";
import { ReactComponent as ChirperCircleIcon } from "../../assets/svg/chirper-circle-solid.svg";

interface AudiencePickerModalProps {
  audience: string;
  setAudience: React.Dispatch<React.SetStateAction<string>>;
}

export const AudiencePickerModal: React.FC<AudiencePickerModalProps> = ({
  audience,
  setAudience,
}) => {
  const audinceOptions = [
    {
      title: "Everyone",
      icon: <GoGlobe />,
      value: "everyone",
      isSelected: audience === "everyone",
    },
    {
      title: "Chirper Circle",
      icon: <ChirperCircleIcon />,
      value: "chirper-circle",
      isSelected: audience === "chirper-circle",
    },
  ];

  return (
    <section className="audience-picker-modal">
      <h1>Choose audience</h1>
      <div className="audience-picker-modal-options">
        {audinceOptions.map((option) => (
          <div
            key={option.title}
            className={`audience-picker-modal-option ${
              option.isSelected ? " selected" : ""
            }`}
            onClick={() => setAudience(option.value)}
          >
            <div className="audience-picker-modal-option-icon">
              {option.icon}
            </div>
            <div className="audience-picker-modal-option-title">
              {option.title}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
