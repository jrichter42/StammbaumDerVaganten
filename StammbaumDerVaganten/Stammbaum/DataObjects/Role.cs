using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    public enum RoleType_Type
    {
        None,
        Custom,
        Stammesfuehrung,
        StellvStammesfuehrung,
        Kassenwart,
        StellvKassenwart,
        Handkasse,
        Meutenfuehrung,
        Meutenassi,
        Rudelfuehrung,
        Sippenfuehrung,
        Gildensprecher,
        Rundensprecher,
        Kreisleitung
    }

    [DataContract]
    public class RoleType : DataPiece<RoleType_Type>
    {

    }

    [DataContract]
    public class Role : DataObject
    {
        protected static int NEXT_ID = 1;

        protected override int GetNEXTID()
        {
            return NEXT_ID;
        }

        protected override void SetNEXTID(int id)
        {
            NEXT_ID = id;
        }

        #region Serialization
        [DataMember]
        public RoleType _T
        {
            get { return type; }
            set { type = value; }
        }
        [DataMember]
        public String _CT
        {
            get { return customType; }
            set { customType = value; }
        }
        [DataMember]
        public GroupType _GT
        {
            get { return groupType; }
            set { groupType = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        protected RoleType type = new RoleType();
        protected String customType = new String(); //If Type set to "Custom"
        protected GroupType groupType = new GroupType(); //This role can be held on Groups of this type

        protected String comment = new String();

        #region Accessors
        public RoleType Type
        {
            get { return type; }
            set { type = value; }
        }

        public String CustomType
        {
            get { return customType; }
            set { customType = value; }
        }

        public GroupType GroupType
        {
            get { return groupType; }
            set { groupType = value; }
        }

        public String Comment
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        public Role() : base()
        {
            type.Init(RoleType_Type.None);
        }

        public Role(bool claimID) : base(claimID)
        {

        }

        public override string ToString()
        {
            string typeString = type.Value.ToString();
            if (type.Value == RoleType_Type.Custom)
            {
                typeString = customType.Value;
            }
            return typeString + " [" + id.ToString() + "]";
        }

        public string ToString_
        {
            get { return ToString(); }
        }
    }
}
