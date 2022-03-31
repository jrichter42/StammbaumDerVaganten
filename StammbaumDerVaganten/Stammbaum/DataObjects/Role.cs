using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    public enum RoleType
    {
        None,
        Custom,
        Stammesfuehrung,
        StellvStammesfuehrung,
        Kassenwart,
        StellvKassenwart,
        Handkasse,
        Meutenfuehrung,
        Meutenassistenz,
        Rudelfuehrung,
        Sippenfuehrung,
        Gildensprecher,
        Rundensprecher,
        Kreisleitung
    }

    [DataContract]
    public class Role : Referenceable<Role>
    {
        [DataMember(Name = "_T")]
        public VersionedData<RoleType> Type { get; set; } = new VersionedData<RoleType>();
        [DataMember(Name = "_CT")]
        public VersionedData<string> CustomType { get; set; } = new VersionedData<string>(); //If Type set to "Custom"
        [DataMember(Name = "_GT")]
        public VersionedData<GroupType> GroupType { get; set; } = new VersionedData<GroupType>(); //This role can be held on Groups of this type, if set to custom: includes all custom types

        [DataMember(Name = "_C")]
        public VersionedData<string> Comment { get; set; } = new VersionedData<string>();

        public Role()
        { }

        public Role(Database context, bool claimID)
            : base(context, claimID)
        { }

        public Role(Database context, bool claimID, RoleType type, GroupType groupType, string comment = "")
            : this(context, claimID, type, "", groupType, comment)
        {
            Debug.Assert(type != RoleType.Custom);
        }

        public Role(Database context, bool claimID, RoleType type, string customType, GroupType groupType, string comment = "")
            : this(context, claimID)
        {
            Type.OverwriteLatestValue(type);
            CustomType.OverwriteLatestValue(customType);
            GroupType.OverwriteLatestValue(groupType);
            Comment.OverwriteLatestValue(comment);
        }

        public override string ToString()
        {
            string typeString = Type.Latest.ToString();
            if (Type.Latest == RoleType.Custom)
            {
                typeString = CustomType.Latest;
            }
            return typeString + " [" + reference.ToString() + "]";
        }
    }
}
