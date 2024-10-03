import Image from "next/image";
import styles from "./styles.module.scss";
import classNames from "classnames";
const Avatar = ({
	avatarUrl = "",
	present = -1,
	bubblePrecedent = "",
	width = 32,
	height = 32,
	editIcon = false,
	editActionHandler = () => {},
	border = false,
}) => {
	return (
		<div className={styles.avatar}>
			<Image
				src={avatarUrl ? avatarUrl : "/avatars/placeholder.png"}
				alt="User avatar"
				className={classNames(styles.image, border && styles.wuth_border)}
				width={width}
				height={height}
			/>
			{/* Presence Indicator */}
			{present != -1 &&
				bubblePrecedent === "" &&
				(present > 0 ? (
					<div className={styles.success}></div>
				) : (
					<div className={styles.inactive}></div>
				))}
			{bubblePrecedent !== "" && (
				<div className={styles.bubble}>{bubblePrecedent}</div>
			)}
			{editIcon && (
				<div className={styles.edit_icon}>
					<div onClick={(e) => editActionHandler()}>
						<Image
							src={"/icons/edit.svg"}
							alt="Edit"
							width={40}
							height={40}
							priority
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default Avatar;
