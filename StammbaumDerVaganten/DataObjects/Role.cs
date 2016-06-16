using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

    public class RoleType : DataPiece<RoleType_Type>
    {

    }

    public class Role : DataObject
    {
        public static int NEXT_ID = 1;

        protected override int GetNEXTID()
        {
            return NEXT_ID;
        }

        protected override void SetNEXTID(int id)
        {
            NEXT_ID = id;
        }

        RoleType type = new RoleType();
        String customType = new String(); //If Type set to "Custom"
        GroupType groupType = new GroupType(); //This role can be held on Groups of this type

        String comment = new String();

        public RoleType_Type Type
        {
            get { return type.Value; }
            set { type.Value = value; }
        }

        public string CustomType
        {
            get { return customType.Value; }
            set { customType.Value = value; }
        }

        public GroupType_Type GroupType
        {
            get { return groupType.Value; }
            set { groupType.Value = value; }
        }

        public Role()
        {
            type.Init(RoleType_Type.None);
        }

        public Role(bool claimID) : base(claimID)
        {

        }
    }
}
