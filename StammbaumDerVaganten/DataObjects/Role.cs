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
        public RoleType Type = new RoleType();
        public String CustomType = new String(); //If Type set to "Custom"
        public GroupType GroupType = new GroupType(); //This role can be held on Groups of this type

        public String Comment = new String();

        public Role()
        {
            Type.Init(RoleType_Type.None);
        }
    }
}
