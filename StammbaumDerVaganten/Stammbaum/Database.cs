using System.Collections.Generic;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Data
    {
        [DataMember(Name = "_SCOUTS")]
        public List<Scout> Scouts { get; set; } = new List<Scout>();
        [DataMember(Name = "_GROUPS")]
        public List<Group> Groups { get; set; } = new List<Group>();
        [DataMember(Name = "_ROLES")]
        public List<Role> Roles { get; set; } = new List<Role>();
        [DataMember(Name = "_TIMEPOINTS")]
        public List<Timepoint> Timepoints { get; set; } = new List<Timepoint>();

        public Data()
        { }

        #region GetStuffByID
        public Scout GetObjectFromReference(Reference<Scout> scoutRef)
        {
            if (!scoutRef.IsValid())
            {
                return null;
            }

            foreach (Scout s in Scouts)
            {
                if (s.Reference == scoutRef)
                {
                    return s;
                }
            }

            return null;
        }

        public Group GetObjectFromReference(Reference<Group> groupRef)
        {
            if (!groupRef.IsValid())
            {
                return null;
            }

            foreach (Group g in Groups)
            {
                if (g.Reference == groupRef)
                {
                    return g;
                }
            }

            return null;
        }

        public Role GetObjectFromReference(Reference<Role> roleRef)
        {
            if (!roleRef.IsValid())
            {
                return null;
            }

            foreach (Role r in Roles)
            {
                if (r.Reference == roleRef)
                {
                    return r;
                }
            }

            return null;
        }

        public Timepoint GetObjectFromReference(Reference<Timepoint> timepointRef)
        {
            if (!timepointRef.IsValid())
            {
                return null;
            }

            foreach (Timepoint t in Timepoints)
            {
                if (t.Reference == timepointRef)
                {
                    return t;
                }
            }

            return null;
        }
        #endregion
    }

    public class Database
    {
        public Data Data;

        public Database()
        {
            Data = new Data();
        }

        public bool Load()
        {
            string dataStr = "";
            if (FileManager.Instance.Read(ref dataStr))
            {
                if (Serializer<Data>.Deserialize(dataStr, ref Data))
                {
                    return true;
                }
            }
            return false;
        }
            
        public bool Save(bool humanReadable = true)
        {
            string dataStr = "";
            if (Serializer<Data>.Serialize(ref dataStr, Data, humanReadable))
            {
                if (FileManager.Instance.Write(dataStr))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
